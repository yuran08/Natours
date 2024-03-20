import mongoose, {
  Model,
  HookNextFunction,
  SchemaDefinition,
  Document,
  QueryWithHelpers,
} from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
const { Schema, model } = mongoose

export interface IUser {
  id: string
  name: string
  email: string
  photo: string
  password: string
  passwordComfirm: string | undefined
  passwordChangedAt: Date
  active: boolean
  role: 'user' | 'guide' | 'admin'
  passwordResetToken: string | undefined
  passwordResetExpires: number | Date | undefined
  passwordCurrent?: string
}

interface UserMethod {
  /**
   * @param password 用户提供密码
   * @param userPassword 用户正确密码
   * @returns 是否正确
   */
  checkPassword(password: string, userPassword: string): Promise<boolean>
  /**
   * 密码是否更改
   * @param JWTTimestamp JWT生成时间
   */
  changedPasswordAfter(JWTTimestamp: number): boolean
  /**
   * 重置密码验证码
   */
  createPasswordResetToken(): string
}

const wrongMessage = (property: keyof IUser) => `A user must have ${property} !`
const wrongValidMessage = (property: keyof IUser) =>
  `Please provide a valid ${property} !`

const userSchema = new Schema<
  IUser,
  Model<IUser>,
  SchemaDefinition<IUser>,
  QueryWithHelpers<IUser, IUser>
>(
  {
    name: {
      type: String,
      required: [true, wrongMessage('name')],
    },
    email: {
      type: String,
      required: [true, wrongMessage('email')],
      unique: true,
      validate: [validator.isEmail, wrongValidMessage('email')],
    },
    photo: String,
    role: {
      type: String,
      enum: ['user', 'guide', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, wrongMessage('password')],
      minlength: 8,
      select: false,
    },
    passwordComfirm: {
      type: String,
      required: [true, wrongMessage('passwordComfirm')],
      validate: {
        validator: function (this: IUser, value: string) {
          return this.password === value
        },
        message: 'Passwords are not the same!',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toObject: {
      transform: (doc, ret) => {
        delete ret.password
        delete ret.__v
        return ret
      },
    },
  },
)

userSchema.pre('save', async function (next: HookNextFunction) {
  if (!this.isModified('password')) return next()

  this.password = await bcrypt.hash(this.password, 12)
  this.passwordComfirm = undefined
  next()
})

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next()

  this.passwordChangedAt = new Date(Date.now() - 1000)

  next()
})

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } })
  next()
})

userSchema.methods.checkPassword = async function (
  password: string,
  userPassword: string,
) {
  return await bcrypt.compare(password, userPassword)
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      (this.passwordChangedAt.getTime() / 1000).toString(),
      10,
    )

    return JWTTimestamp < changedTimestamp
  }

  // False means NOT changed
  return false
}

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  console.log({ resetToken }, this.passwordResetToken)

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000

  return resetToken
}

const User = model<
  IUser,
  Model<IUser, QueryWithHelpers<IUser, any>, UserMethod>
>('user', userSchema)

export default User

import mongoose, {
  Model,
  HookNextFunction,
  SchemaDefinition,
  Document,
  QueryWithHelpers,
} from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'
const { Schema, model } = mongoose

export interface IUser {
  name: string
  email: string
  photo: string
  password: string
  passwordComfirm: string | undefined
  passwordChangedAt: Date
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
}

const wrongMessage = (property: keyof IUser) => `A user must have ${property} !`
const wrongValidMessage = (property: keyof IUser) =>
  `Please provide a valid ${property} !`

const userSchema = new Schema<IUser, Model<IUser>, SchemaDefinition<IUser>>({
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
})

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

const User = model<IUser, Model<IUser, QueryWithHelpers<any, any>, UserMethod>>(
  'user',
  userSchema,
)

export default User

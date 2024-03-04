import mongoose, {
  Model,
  HookNextFunction,
  SchemaDefinition,
  Document,
} from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'
const { Schema, model } = mongoose

interface IUser {
  name: string
  email: string
  photo: string
  password: string
  passwordComfirm: string | undefined
}

interface UserMethod {
  checkPassword(password: string, userPassword: string): Promise<boolean>
}

const wrongMessage = (property: keyof IUser) => `A user must have ${property} !`
const wrongValidMessage = (property: keyof IUser) =>
  `Please provide a valid ${property} !`

const userShcema = new Schema<IUser, Model<IUser>, SchemaDefinition<IUser>>({
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
})

userShcema.pre('save', async function (next: HookNextFunction) {
  if (!this.isModified('password')) return next()

  this.password = await bcrypt.hash(this.password, 12)
  this.passwordComfirm = undefined
  next()
})

userShcema.methods.checkPassword = async function (
  password: string,
  userPassword: string,
) {
  return await bcrypt.compare(password, userPassword)
}

const User = model<IUser, Model<any, any, UserMethod>>('user', userShcema)

export default User

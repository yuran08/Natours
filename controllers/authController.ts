import User from '../models/userModal.js'
import catchError from '../utils/catchError.js'
import jwt from 'jsonwebtoken'
import { AppError } from '../types/error.js'

const getToken = (id: string | object) =>
  jwt.sign({ id }, String(process.env.JWT_SECRET), {
    expiresIn: process.env.JWT_EXPRIERS_IN,
  })

export const signup = catchError(async (req, res) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordComfirm: req.body.passwordComfirm,
  })

  const token = getToken(user._id)

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user,
    },
  })
})

export const login = catchError(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    throw new AppError(400, 'Provide email and password !')

  const user = await User.findOne({ email }).select('+password')

  if (!user) throw new AppError(400, 'User Not Found (Incorrect email) !')
  if (!(await user.checkPassword(password, user.password)))
    throw new AppError(401, 'Incorrect password !')

  const token = getToken(user._id)
  res.status(200).json({
    status: 'success',
    token,
  })
})

import User from '../models/userModal.js'
import catchError from '../utils/catchError.js'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { AppError } from '../types/error.js'
import { NextFunction } from 'express'

interface Decoded extends JwtPayload {
  id: string
}

const getToken = (id: string | object) =>
  jwt.sign({ id }, String(process.env.JWT_SECRET), {
    expiresIn: process.env.JWT_EXPRIERS_IN,
  })

const verifyToken = (token: string): Promise<Decoded> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, String(process.env.JWT_SECRET), (err, decoded) => {
      if (err) {
        reject(err)
      } else {
        resolve(decoded as Decoded)
      }
    })
  })
}

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

export const protect = catchError(async (req, res, next) => {
  const token = req.headers.token as string
  if (!token) {
    throw new AppError(
      401,
      'You are not logged in! Please log in to get access.',
    )
  }

  let userId, time
  await verifyToken(token)
    .then(res => {
      userId = res.id
      time = res.iat
    })
    .catch(err => {
      throw err
    })

  const user = await User.findById(userId)
  if (!user) {
    throw new AppError(
      401,
      'The user belonging to this token does no longer exist.',
    )
  }

  if (time && user.changedPasswordAfter(time)) {
    throw new AppError(
      401,
      'User recently changed password! Please log in again.',
    )
  }
  ;(req as any).user = user
  next()
})

import User, { IUser } from '../models/userModal.js'
import catchError from '../utils/catchError.js'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { AppError } from '../types/error.js'
import { sendEmail } from '../utils/email.js'
import crypto from 'node:crypto'
import { CookieOptions, Response } from 'express'
import { Document } from 'mongoose'
import { showRemovedFieldsObj } from '../utils/utils.js'
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

const createSendToken = (
  user: IUser & Document<any, any, IUser>,
  statusCode: number,
  res: Response,
) => {
  const token = getToken(user._id)
  const cookieOptions: CookieOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  }
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true

  res.cookie('jwt', token, cookieOptions)

  res.status(statusCode).json({
    status: 'success',
    token,
    data: user.toObject(),
  })
}

export const signup = catchError(async (req, res) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordComfirm: req.body.passwordComfirm,
  })

  createSendToken(user, 201, res)
})

export const login = catchError(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    throw new AppError(400, 'Provide email and password !')

  const user = await User.findOne({ email }).select('+password')

  if (!user) throw new AppError(400, 'User Not Found (Incorrect email) !')
  if (!(await user.checkPassword(password, user.password)))
    throw new AppError(401, 'Incorrect password !')

  createSendToken(user, 200, res)
})

export const protect = catchError(async (req, res, next) => {
  let token = req.headers.authorization as string

  if (token && token.startsWith('Bearer')) {
    token = token.split(' ')[1]
  }

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

  req.user = user
  next()
})

export const permissionCheck = (...roles: string[]) => {
  return catchError(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(
        403,
        'You do not have permission to perform this action.',
      )
    }
    next()
  })
}

export const forgotPassword = catchError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    throw new AppError(404, 'There is no user with email address.')
  }

  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token for Natours (valid for 10 min)',
      message: message,
    })

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    })
  } catch (error) {
    throw new AppError(500, 'send email error !!!')
  }
})

export const resetPassword = catchError(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password')

  if (!user) {
    throw new AppError(400, 'Token is invalid or has expired')
  }
  if (await user.checkPassword(req.body.password, user.password)) {
    throw new AppError(400, 'password have no change.')
  }

  user.password = req.body.password
  user.passwordComfirm = req.body.passwordComfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  createSendToken(user, 200, res)
})

export const updateMyPassword = catchError(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password')

  if (
    !req.body.passwordCurrent ||
    !(await user.checkPassword(req.body.passwordCurrent, user.password))
  ) {
    throw new AppError(400, 'Your current password is wrong.')
  }
  if (await user.checkPassword(req.body.password, user.password)) {
    throw new AppError(400, 'password have no change.')
  }

  user.password = req.body.password
  user.passwordComfirm = req.body.passwordComfirm
  await user.save()

  createSendToken(user, 200, res)
})

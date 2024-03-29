import { Request, Response, NextFunction } from 'express-serve-static-core'
import { AppError } from '../types/error.js'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'

export const requestUrlError = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const err = new AppError(StatusCodes.NOT_FOUND, `Invalid url: ${req.url} .`)
  next(err)
}

const handleCastErrorDB = (err: AppError) => {
  const message = `Invalid ${err.path}: ${err.value}.`
  return new AppError(400, message)
}

const handleDuplicateFieldsDB = (err: AppError) => {
  const key = Object.keys({ ...err.keyPattern })[0]
  const value = Object.values({ ...err.keyValue })[0]

  const message = `Duplicate field '${key}': '${value}'. Please use another value!`
  return new AppError(400, message)
}

const handleValidationErrorDB = (err: AppError) => {
  const errors = Object.values(err.errors).map((el: any) => el.message)
  const message = `Invalid input data. ${errors.join('. ')}`
  return new AppError(400, message)
}

const handleJWTError = () =>
  new AppError(401, 'Invalid token. Please log in again!')

const handleJWTExpiredError = () =>
  new AppError(401, 'Your token has expired! Please log in again.')

const sendError = (err: AppError & Error, res: Response) => {
  if (err.isOperational) {
    res.status(err.status).json({
      status: err.hasOwnProperty('status') ? 'fail' : 'error',
      message: err.message,
    })
  } else {
    console.log(err, 'no Operational Err !!!')

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
      err: err.stack,
    })
  }
}

export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err.name === 'CastError') err = handleCastErrorDB(err)
  if (err.name === 'ValidationError') err = handleValidationErrorDB(err)
  if (err.code === 11000) err = handleDuplicateFieldsDB(err)
  if (err.name === 'JsonWebTokenError') err = handleJWTError()
  if (err.name === 'TokenExpiredError') err = handleJWTExpiredError()
  sendError(err, res)
  next()
}

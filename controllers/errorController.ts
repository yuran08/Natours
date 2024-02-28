import { Request, Response, NextFunction } from 'express-serve-static-core'
import { AppError } from '../types/error.js'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'

export const requestUrlError = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const err = new AppError(StatusCodes.NOT_FOUND, 'unvalid url')
  next(err)
}

export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(err)

  res.status(err.status || 500).json({
    status: err.hasOwnProperty('status') ? 'fail' : 'error',
    message: err.message,
  })
  next()
}

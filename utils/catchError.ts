import { Request, Response } from 'express'
import { AppError } from '../types/error.js'
export default function (fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response) => {
    fn(req, res).catch(error => {
      if (error instanceof AppError) {
        res.status(400).json({
          status: error.status ? 'success' : 'fail',
          message: error.message,
        })
      }
    })
  }
}

export class AppError extends Error {
  status: number
  isOperational: boolean
  code?: number
  path?: string
  value?: string
  errors?: any
  keyPattern?: object
  keyValue?: object

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

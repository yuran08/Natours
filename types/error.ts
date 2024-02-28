export class AppError extends Error {
  status: number
  isOperational: boolean
  path?: string
  value?: string
  errors?: any

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

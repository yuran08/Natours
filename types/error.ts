export class AppError extends Error {
  status: number
  isOperational: boolean

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

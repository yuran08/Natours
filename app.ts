import express from 'express'
import morgan from 'morgan'
import dotenv from 'dotenv'
import tourRouter from './routes/tourRoutes.js'
import userRoute from './routes/userRoutes.js'
import { protect } from './controllers/authController.js'
import {
  requestUrlError,
  globalErrorHandler,
} from './controllers/errorController.js'

dotenv.config({ path: './config.env' })

const app: express.Application = express()

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
app.use(protect)
app.use(express.json()) //midleware to get req body
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRoute)

app.all('*', requestUrlError)
app.use(globalErrorHandler)

export default app

import express from 'express'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { rateLimit } from 'express-rate-limit'
// @ts-ignore
import helmet from 'helmet'
import path from 'path'
import ExpressMongoSanitize from 'express-mongo-sanitize'
// @ts-ignore
import xss from 'xss-clean'
import hpp from 'hpp'

import tourRoute from './routes/tourRoutes.js'
import userRoute from './routes/userRoutes.js'
import reviewRoute from './routes/reviewRoutes.js'
import {
  requestUrlError,
  globalErrorHandler,
} from './controllers/errorController.js'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

dotenv.config({ path: './config.env' })

const app: express.Application = express()

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet())

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
})
app.use('/api', limiter)

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }))

// Data sanitization against NoSQL query injection
app.use(ExpressMongoSanitize())

// Data sanitization against XSS
app.use(xss())

// Prevent parameter pollution
app.use(
  hpp({
    // whitelist: [
    //   'duration',
    //   'ratingsQuantity',
    //   'ratingsAverage',
    //   'maxGroupSize',
    //   'difficulty',
    //   'price'
    // ]
  }),
)

// Serving static files
app.use(express.static(`${__dirname}/public`))

// 2) Routes
app.use('/api/v1/tours', tourRoute)
app.use('/api/v1/users', userRoute)
app.use('/api/v1/reviews', reviewRoute)

app.all('*', requestUrlError)
app.use(globalErrorHandler)

export default app

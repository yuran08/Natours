import express from 'express'
import {
  getAllTour,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasPerformTour,
  getTourStatus,
  getMonthlyPlan,
} from '../controllers/tourController.js'
import { Router } from 'express-serve-static-core'
import reviewRoute from './reviewRoutes.js'

const tourRoute: Router = express.Router()

tourRoute.use('/:tourId/reviews', reviewRoute)

tourRoute.route('/tourStatus').get(getTourStatus)
tourRoute.route('/top-5-perform').get(aliasPerformTour, getAllTour)
tourRoute.route('/monthly-plan/:year').get(getMonthlyPlan)

tourRoute.route('/').get(getAllTour).post(createTour)
tourRoute.route('/:id').get(getTour).patch(updateTour).delete(deleteTour)

export default tourRoute

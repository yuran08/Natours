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

const tourRouter: Router = express.Router()
tourRouter.route('/tourStatus').get(getTourStatus)
tourRouter.route('/top-5-perform').get(aliasPerformTour, getAllTour)
tourRouter.route('/monthly-plan/:year').get(getMonthlyPlan)

tourRouter.route('/').get(getAllTour).post(createTour)
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour)

export default tourRouter

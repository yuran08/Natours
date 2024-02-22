import express from 'express'
import {
  getAllTour,
  createTour,
  getTour,
  updateTour,
  deleteTour,aliasPerformTour,
} from '../controllers/tourController.js'
import { Router } from 'express-serve-static-core'

const tourRouter: Router = express.Router()
tourRouter.route('/top-5-perform').get(aliasPerformTour, getAllTour)

tourRouter.route('/').get(getAllTour).post(createTour)
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour)

export default tourRouter

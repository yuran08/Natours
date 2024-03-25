import express from 'express'

import { Router } from 'express-serve-static-core'
import {
  createReview,
  deleteReview,
  getAllReview,
  getReview,
  setTourUserIds,
  updateReview,
} from '../controllers/reviewController.js'
import { permissionCheck, protect } from '../controllers/authController.js'

const reviewRoute: Router = express.Router({ mergeParams: true })

reviewRoute.use(protect)

reviewRoute
  .route('/')
  .get(getAllReview)
  .post(permissionCheck('user'), setTourUserIds, createReview)

reviewRoute
  .route('/:id')
  .get(getReview)
  .patch(permissionCheck('user', 'admin'), updateReview)
  .delete(permissionCheck('user', 'admin'), deleteReview)

export default reviewRoute

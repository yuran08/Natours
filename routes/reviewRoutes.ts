import express from 'express'

import { Router } from 'express-serve-static-core'
import {
  createReview,
  deleteReview,
  getAllReview,
  getReview,
  setTourUserIds,
} from '../controllers/reviewController.js'
import { protect } from '../controllers/authController.js'

const reviewRoute: Router = express.Router({ mergeParams: true })

reviewRoute
  .route('/')
  .get(protect, getAllReview)
  .post(protect, setTourUserIds, createReview)
reviewRoute.route('/:id').get(getReview).delete(deleteReview)

export default reviewRoute

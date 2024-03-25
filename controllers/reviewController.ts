import { NextFunction, Request, Response, RequestHandler } from 'express'
import catchError from '../utils/catchError.js'
import Review from '../models/reviewModel.js'
import {
  deleteOne,
  createOne,
  updateOne,
  getOne,
  getAll,
} from './handleFactory.js'

export const setTourUserIds = catchError(async (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId
  if (!req.body.user) req.body.user = req.user.id
  next()
})

export const getReview = getOne(Review)
export const getAllReview = getAll(Review)
export const createReview = createOne(Review)
export const deleteReview = deleteOne(Review)
export const updateReview = updateOne(Review)

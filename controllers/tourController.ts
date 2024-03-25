import Tour from '../models/tourModel.js'
import { NextFunction, Request, Response, RequestHandler } from 'express'
import catchError from '../utils/catchError.js'
import {
  deleteOne,
  createOne,
  updateOne,
  getOne,
  getAll,
} from './handleFactory.js'

// middleware
export const aliasPerformTour: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'
  req.query.fields =
    'name,duration,ratingsAverage,ratingsQuantity,difficulty,price,maxGroupSize'
  next()
}

// controller
export const getTour = getOne(Tour, { path: 'reviews' })
export const getAllTour = getAll(Tour)
export const updateTour = updateOne(Tour)
export const createTour = createOne(Tour)
export const deleteTour = deleteOne(Tour)

export const getTourStatus = catchError(async (req, res) => {
  const status = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ])

  res.status(200).json({
    status: 'success',
    data: status,
  })
})

export const getMonthlyPlan = catchError(async (req, res) => {
  const year = Number(req.params.year)

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        tourCount: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { month: 1 },
    },
  ])
  res.status(200).json({
    status: 'success',
    data: plan,
  })
})

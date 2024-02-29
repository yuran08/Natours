import Tour from '../models/tourModel.js'
import Query from '../utils/query.js'
import { NextFunction, Request, Response, RequestHandler } from 'express'
import catchError from '../utils/catchError.js'
import { AppError } from '../types/error.js'
import { StatusCodes } from 'http-status-codes'

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
export const getAllTour = catchError(async (req, res) => {
  const query = new Query(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()

  const tours = await query.query

  res.status(200).json({
    status: 'success',
    total: tours.length,
    data: tours,
  })
})

export const createTour = catchError(async (req, res) => {
  const newTour = await Tour.create(req.body)
  res.status(200).json({
    status: 'success',
    data: newTour,
  })
})

export const getTour = catchError(async (req, res) => {
  const tour = await Tour.findById(req.params.id)
  if (!tour) throw new AppError(StatusCodes.BAD_REQUEST, 'unexist tour!')
  res.status(200).json({
    status: 'success',
    data: tour,
  })
})

export const updateTour = catchError(async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  })
  if (!tour) throw new AppError(StatusCodes.BAD_REQUEST, 'unexist tour!')
  res.status(200).json({
    status: 'success',
    data: tour,
  })
})

export const deleteTour = catchError(async (req, res) => {
  const tour = await Tour.findByIdAndDelete(req.params.id)
  if (!tour) throw new AppError(StatusCodes.BAD_REQUEST, 'unexist tour!')

  res.status(200).json({
    status: 'success',
  })
})

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

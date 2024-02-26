import Tour from '../models/tourModel.js'
import Query from '../utils/query.js'
import { NextFunction, Request, Response, RequestHandler } from 'express'
import catchError from '../utils/catchError.js'
import { AppError } from '../types/error.js'

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
export const getAllTour = async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      data: error,
    })
  }
}

export const createTour = async (req: Request, res: Response) => {
  try {
    const newTour = await Tour.create(req.body)
    res.status(200).json({
      status: 'success',
      data: newTour,
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      data: error,
    })
  }
}

export const getTour = async (req: Request, res: Response) => {
  try {
    const tour = await Tour.findById(req.params.id)
    res.status(200).json({
      status: 'success',
      data: tour,
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      data: error,
    })
  }
}

export const updateTour = async (req: Request, res: Response) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
    res.status(200).json({
      status: 'success',
      data: tour,
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      data: error,
    })
  }
}

export const deleteTour = catchError(async (req, res) => {
  const tour = await Tour.findByIdAndDelete(req.params.id)
  if (!tour) {
    throw new AppError(0, 'unexist tour!')
  }

  res.status(200).json({
    status: 'success',
  })
})

export const getTourStatus = catchError(async (req: Request, res: Response) => {
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

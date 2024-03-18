import { NextFunction, Request, Response, RequestHandler } from 'express'
import catchError from '../utils/catchError.js'
import { AppError } from '../types/error.js'
import mongoose, { Model } from 'mongoose'
import Query from '../utils/query.js'

export const deleteOne = (model: Model<any, any, any>) =>
  catchError(async (req, res) => {
    const doc = await model.findByIdAndDelete(req.params.id)

    if (!doc) {
      throw new AppError(404, 'No document found with that ID')
    }

    res.status(200).json({
      status: 'success',
      data: null,
    })
  })

export const updateOne = (model: Model<any, any, any>) =>
  catchError(async (req, res) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!doc) {
      throw new AppError(404, 'No document found with that ID')
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    })
  })

export const createOne = (model: Model<any>) =>
  catchError(async (req, res) => {
    const doc = await model.create(req.body)

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    })
  })

export const getOne = (model: Model<any>) =>
  catchError(async (req, res) => {
    const doc = await model.findById(req.params.id)

    if (!doc) {
      throw new AppError(404, 'No document found with that ID')
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    })
  })

export const getAll = (model: Model<any>) =>
  catchError(async (req, res) => {
    const doc = await new Query(model.find(), req.query)
      .filter()
      .limitFields()
      .sort()
      .paginate()
      .result()

    res.status(200).json({
      status: 'success',
      total: doc.length,
      data: {
        data: doc,
      },
    })
  })

import mongoose, {
  Model,
  HookNextFunction,
  SchemaDefinition,
  Document,
  QueryWithHelpers,
  ObjectId,
} from 'mongoose'
import Tour from './tourModel'
import User from '../models/userModal.js'
const { Schema, model } = mongoose

interface IReview {
  review: string
  rating: number
  createdAt: Date
  tour: ObjectId
  user: ObjectId
}

const reviewSchema = new Schema<
  IReview,
  Model<IReview>,
  SchemaDefinition<IReview>
>(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      max: 5,
      min: 1,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: Schema.Types.ObjectId,
      ref: Tour,
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: User,
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
)

const Review = model<IReview, Model<IReview, QueryWithHelpers<any, any>>>(
  'Review',
  reviewSchema,
)

export default Review

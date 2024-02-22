import mongoose, { Model } from 'mongoose'
const { Schema, model } = mongoose
// import { model } from 'mongoose'
interface ITour {
  name: String
  price: Number
  difficulty: 'easy' | 'medium' | 'difficult'
  duration: Number
  maxGroupSize: Number
  ratingsAverage?: Number
  ratingsQuantity?: Number
  summary: String
  description?: String
  imageCover: String
  images: String[]
  startDates: Date[]
  createAt: Date
}

// interface TourModel extends Model<ITour> {}

const tourSchema = new Schema<ITour, Model<ITour>>({
  name: {
    type: String,
    required: [true, 'A tour must have name'],
    unique: true,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have price'],
  },
  priceDiscount: {
    type: Number,
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is either: easy, medium, difficult',
    },
  },
  duration: {
    type: Number,
    require: [true, 'A tour must have duration'],
  },
  maxGroupSize: {
    type: Number,
    require: [true, 'A tour must have group size'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  summary: {
    type: String,
    trim: true,
    require: [true, 'A tour must have summary'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    require: [true, 'A tour must have cover image'],
  },
  images: {
    type: [String],
  },
  startDates: {
    type: [Date],
  },
  createAt: {
    type: [Date],
    default: Date.now(),
  },
})

const Tour = model<ITour>('Tour', tourSchema)

export default Tour
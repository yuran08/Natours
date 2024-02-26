import mongoose, { Model, SchemaTypeOptions, QueryWithHelpers } from 'mongoose'
const { Schema, model } = mongoose
// import { model } from 'mongoose'
interface ITour {
  name: string
  price: number
  difficulty: 'easy' | 'medium' | 'difficult'
  duration: number
  maxGroupSize: number
  ratingsAverage?: number
  ratingsQuantity?: number
  summary: string
  description?: string
  imageCover: string
  images: string[]
  startDates: Date[]
  createAt: Date
}

// interface TourModel extends Model<ITour> {}

const tourSchema = new Schema<ITour, Model<ITour>, SchemaTypeOptions<any>>(
  {
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
  },
  {
    toJSON: { virtuals: true },
  },
)

tourSchema.virtual('durationWeeks').get(function (this: ITour) {
  return (this.duration / 7).toFixed(2)
})

const Tour = model<ITour, Model<ITour, SchemaTypeOptions<any>>>(
  'Tour',
  tourSchema,
)

export default Tour

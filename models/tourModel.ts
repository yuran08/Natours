import mongoose, {
  Model,
  SchemaTypeOptions,
  QueryWithHelpers,
  HookNextFunction,
  Aggregate,
} from 'mongoose'
import slugify from 'slugify'
import validator from 'validator'
const { Schema, model } = mongoose
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
  slug: string
  secretTour: boolean
}

const tourSchema = new Schema<ITour, Model<ITour>, SchemaTypeOptions<any>>(
  {
    name: {
      type: String,
      required: [true, 'A tour must have name'],
      unique: true,
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    price: {
      type: Number,
      required: [true, 'A tour must have price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (this: ITour, value: number) {
          return value < this.price
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
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
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
  },
)

tourSchema.virtual('durationWeeks').get(function (this: ITour) {
  return (this.duration / 7).toFixed(2)
})

tourSchema.pre('save', function (next: HookNextFunction) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

tourSchema.pre(
  /^find/,
  function (this: QueryWithHelpers<any, any>, next: HookNextFunction) {
    this.find({ secretTour: { $ne: true } })
    next()
  },
)

tourSchema.post(/^find/, function (docs, next: HookNextFunction) {
  console.log(docs)
  next()
})

tourSchema.pre(
  'aggregate',
  function (this: Aggregate<Object>, next: HookNextFunction) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
    next()
  },
)

tourSchema.post('aggregate', function (docs, next: HookNextFunction) {
  console.log(docs)
  next()
})

const Tour = model<ITour, Model<ITour>, SchemaTypeOptions<any>>(
  'Tour',
  tourSchema,
)

export default Tour

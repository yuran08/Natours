import mongoose, {
  Model,
  SchemaTypeOptions,
  QueryWithHelpers,
  HookNextFunction,
  Aggregate,
  SchemaDefinition,
  ObjectId,
} from 'mongoose'
import slugify from 'slugify'
import validator from 'validator'
import User from './userModal.js'
const { Schema, model } = mongoose
export interface ITour {
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
  priceDiscount: number
  startLocation: object
  locations: object[]
  guides: ObjectId[]
}

const tourSchema = new Schema<ITour, Model<ITour>, SchemaDefinition<ITour>>(
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
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: Schema.Types.ObjectId,
        ref: User,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

tourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour',
})

tourSchema.virtual('durationWeeks').get(function (this: ITour) {
  return (this.duration / 7).toFixed(2)
})

tourSchema.pre('save', function (next: HookNextFunction) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

// tourSchema.pre('save', async function (next: HookNextFunction) {
//   const guidesPromise = this.guides.map(id => User.findById(id))
//   this.guides = await Promise.all(guidesPromise)
//   next()
// })

tourSchema.pre(
  /^find/,
  function (this: QueryWithHelpers<any, any>, next: HookNextFunction) {
    this.find({ secretTour: { $ne: true } })
    next()
  },
)

tourSchema.pre(
  /^find/,
  function (this: QueryWithHelpers<any, any>, next: HookNextFunction) {
    this.populate({
      path: 'guides',
      select: '-__v -passwordChangedAt',
    })
    next()
  },
)

tourSchema.post(/^find/, function (docs, next: HookNextFunction) {
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
  next()
})

const Tour = model<ITour, Model<ITour, QueryWithHelpers<any, any>>>(
  'Tour',
  tourSchema,
)

export default Tour

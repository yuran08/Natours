import { AppError } from '../types/error.js'
import User from '../models/userModal.js'
import catchError from '../utils/catchError.js'
import Query from '../utils/query.js'
import {
  deleteOne,
  createOne,
  updateOne,
  getOne,
  getAll,
} from './handleFactory.js'

const filterObj = (obj: { [key: string]: any }, ...allowedFields: string[]) => {
  let newObj: { [key: string]: any } = {}
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

export const getUser = getOne(User)
export const getAllUser = getAll(User)
export const deleteUser = deleteOne(User)

export const updateMe = catchError(async (req, res) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordComfirm) {
    throw new AppError(
      400,
      'This route is not for password updates. Please use /updateMyPassword.',
    )
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email')

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  })
})

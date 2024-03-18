import express, { Router } from 'express'
import {
  login,
  permissionCheck,
  protect,
  signup,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js'
import {
  deleteUser,
  getAllUser,
  updateMe,
} from '../controllers/userController.js'

const userRoute: Router = express.Router()

userRoute.post('/signup', signup)
userRoute.post('/login', login)
userRoute.post('/forgotPassword', forgotPassword)
userRoute.post('/resetPassword/:token', resetPassword)

userRoute.patch('/updateMe', protect, updateMe)

userRoute.route('/').get(protect, getAllUser)

userRoute.route('/:id').delete(protect, permissionCheck('admin'), deleteUser)

export default userRoute

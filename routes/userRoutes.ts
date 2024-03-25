import express, { Router } from 'express'
import {
  login,
  permissionCheck,
  protect,
  signup,
  forgotPassword,
  resetPassword,
  updateMyPassword,
} from '../controllers/authController.js'
import {
  deleteUser,
  getAllUser,
  updateMe,
  deleteMe,
  getMe,
  getUser,
  updateUser,
} from '../controllers/userController.js'

const userRoute: Router = express.Router()

userRoute.post('/signup', signup)
userRoute.post('/login', login)
userRoute.post('/forgotPassword', forgotPassword)
userRoute.patch('/resetPassword/:token', resetPassword)

userRoute.use(protect)

userRoute.get('/me', getMe, getUser)
userRoute.patch('/uodateMyPassword', updateMyPassword)
userRoute.delete('/deleteMe', deleteMe)
userRoute.patch('/updateMe', updateMe)

userRoute.route('/').get(getAllUser)

userRoute
  .route('/:id')
  .get(getUser)
  .delete(permissionCheck('admin'), deleteUser)
  .patch(permissionCheck('admin'), updateUser)

export default userRoute

import express, { Router } from 'express'
import { login, protect, signup } from '../controllers/authController.js'
import { getAllUser, updateMe } from '../controllers/userController.js'

const userRoute: Router = express.Router()

userRoute.post('/signup', signup)
userRoute.post('/login', login)

userRoute.patch('/updateMe', protect, updateMe)

userRoute.route('/').get(protect, getAllUser)

export default userRoute

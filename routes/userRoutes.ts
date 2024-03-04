import express, { Router } from 'express'
import { login, signup } from '../controllers/authController.js'
import { getAllUser } from '../controllers/userController.js'

const userRoute: Router = express.Router()

userRoute.post('/signup', signup)
userRoute.post('/login', login)

userRoute.route('/').get(getAllUser)

export default userRoute

import { Request, Response, NextFunction } from 'express-serve-static-core'
import { ITour } from 'models/tourModel.js'
import { IUser } from 'models/userModal.js'

interface MyRequest extends Request<any, any, MyBody> {
  customProperty: string
  user: MyBody
}
interface MyBody extends IUser {
  id?: any
  tour?: any
  user?: any
  name: string
}

export default function (
  fn: (req: MyRequest, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: MyRequest & any, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next)
  }
}

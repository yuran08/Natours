import { Request, Response, NextFunction } from 'express-serve-static-core'
import { IUser } from 'models/userModal.js'

interface MyRequest extends Request<any, any, MyBody> {
  customProperty: string
}
interface MyBody extends IUser {
  name: string
}

export default function (
  fn: (req: MyRequest, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: MyRequest & any, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next)
  }
}

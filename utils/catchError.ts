import { Request, Response, NextFunction } from 'express-serve-static-core'

export default function (fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next)
  }
}

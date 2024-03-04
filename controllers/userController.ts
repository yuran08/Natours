import User from '../models/userModal.js'
import catchError from '../utils/catchError.js'
import Query from '../utils/query.js'

export const getAllUser = catchError(async (req, res) => {
  const users = await new Query(User.find(), req.params)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .result()

  console.log((req as any).user)
  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  })
})

import Tour from '../models/tourModel.js';
import Query from '../utils/query.js';
// middleware
export const aliasPerformTour = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields
        =
            'name,duration,ratingsAverage,ratingsQuantity,difficulty,price,maxGroupSize';
    next();
};
// controller
export const getAllTour = async (req, res) => {
    try {
        const query = new Query(Tour.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const tours = await query.query;
        res.status(200).json({
            status: 'success',
            total: tours.length,
            data: tours,
        });
    }
    catch (error) {
        res.status(400).json({
            status: 'fail',
            data: error,
        });
    }
};
export const createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body);
        res.status(200).json({
            status: 'success',
            data: newTour,
        });
    }
    catch (error) {
        res.status(400).json({
            status: 'fail',
            data: error,
        });
    }
};
export const getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: tour,
        });
    }
    catch (error) {
        res.status(400).json({
            status: 'fail',
            data: error,
        });
    }
};
export const updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        res.status(200).json({
            status: 'success',
            data: tour,
        });
    }
    catch (error) {
        res.status(400).json({
            status: 'fail',
            data: error,
        });
    }
};
export const deleteTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndDelete(req.params.id);
        if (!tour) {
            throw new Error('unexist tour !');
        }
        res.status(200).json({
            status: 'success',
        });
    }
    catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error,
        });
    }
};
//# sourceMappingURL=tourController.js.map
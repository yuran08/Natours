import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import tourRouter from './routes/tourRoutes.js';
dotenv.config({ path: './config.env' });
const app = express();
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(express.json()); //midleware to get req body
app.use('/api/v1/tours', tourRouter);
export default app;
//# sourceMappingURL=app.js.map
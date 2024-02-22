import mongoose from 'mongoose';
import app from './app.js';
//mongoose connect
const DB = String(process.env.DATABASE).replace('<PASSWORD>', String(process.env.DATABASE_PASSWORD));
mongoose.Promise = global.Promise;
mongoose
    .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})
    .then(() => console.log('MongoDB Connection Succeeded.'))
    .catch(() => console.log('error !!!'));
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`app run for port ${port}`);
});
//# sourceMappingURL=service.js.map
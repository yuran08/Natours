import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Tour from '../../models/tourModel.js';
import tourList from './tours-simple.js';
dotenv.config({ path: './config.env' });
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
// Import Data into DB
const importData = async () => {
    try {
        await Tour.create(tourList);
        console.log('Data successfully imported!');
    }
    catch (error) {
        console.log(`err: ${error}`);
    }
    process.exit();
};
// DELETE ALL DATA FROM DB
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data successfully deleted!');
    }
    catch (err) {
        console.log(err);
    }
    process.exit();
};
if (process.argv[2] === '--import') {
    importData();
}
else if (process.argv[2] === '--delete') {
    deleteData();
}
//# sourceMappingURL=import-dev-data.js.map
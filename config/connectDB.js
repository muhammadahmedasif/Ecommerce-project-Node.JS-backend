import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();


if (!process.env.MONGODB_URL) {
    throw new Error(
        "Please Provide MONGODB_URL in the .env file"
    )
}
const connectDB = async () => {
    try {

        const conn = await mongoose.connect(process.env.MONGODB_URL);

        console.log(`DB Connection Successful: ${conn.connection.host}`);

    } catch (error) {

        console.error(`MongoDB Connection Error: ${error.message}`);

        process.exit(1);

    }
}

export default connectDB;
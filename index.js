import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet, { crossOriginResourcePolicy } from 'helmet';
import connectDB from './config/connectDB.js';
import userRouter from './routes/user.route.js';
import categoryRouter from './routes/category.route.js';
import productRouter from './routes/product.route.js';
import cartRouter from './routes/cartproduct.route.js';
import mylistRouter from './routes/mylist.route.js';

const app = express();

connectDB();

app.use(cors());
// This is giving error so commenting this
// app.options("*", cors());

app.use(express.json());
app.use(cookieParser());
app.use(morgan());
app.use(helmet({
    crossOriginResourcePolicy : false
}));

app.use(express.urlencoded({ extended: true }));

app.get('/' , (req,res)=>{
    res.json({
        message:"Server is Running on " + process.env.PORT
    })
})

app.use('/api/user', userRouter)
app.use('/api/category', categoryRouter)
app.use('/api/product', productRouter)
app.use('/api/cartproduct', cartRouter)
app.use('/api/mylist', mylistRouter)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
import { startServer } from './configs/server'
import { connectDB } from './configs/db'
import dotenv from 'dotenv'
import express, { Express } from 'express'
dotenv.config()

import AuthRoutes from './routes/authRoutes'
import CategoryRoutes from './routes/categoryRoutes'
import ProductRoutes from './routes/productRoutes'
import CartRoutes from './routes/cartRoutes'
import WishlistRoutes from './routes/wishlistRoutes'
import OrderRoutes from './routes/orderRoutes'
import CouponRoutes from './routes/couponRoutes'
import PaymentRoutes from './routes/paymentRoutes'
import NotificationRoutes from './routes/notificationRoutes'

const PORT: number = process.env.PORT ? Number(process.env.PORT) : 4000;
const MONGODB_URI: string = process.env.MONGODB_URI ? String(process.env.MONGODB_URI) : ''


let app: Express; 

const start = async() => {
    try{
        app = await startServer(PORT);
    }catch(err){
        throw(err)
        return
    }
    try{
        const connection = await connectDB(MONGODB_URI).catch(err => console.error(err));
    }catch(err){
        throw(err)
        return 
    }

    app.use(express.json())

    app.use('/api/auth/', AuthRoutes)
    app.use('/api/categories', CategoryRoutes)
    app.use('/api/products', ProductRoutes)
    app.use('/api/cart', CartRoutes)
    app.use('/api/wishlist', WishlistRoutes)
    app.use('/api/orders', OrderRoutes)
    app.use('/api/coupons', CouponRoutes)
    app.use('/api/payments', PaymentRoutes)
    app.use('/api/notifications', NotificationRoutes)
}

start()


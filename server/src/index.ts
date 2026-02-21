import { startServer } from './configs/server'
import { connectDB } from './configs/db'
import dotenv from 'dotenv'
import express, { Express } from 'express'
dotenv.config()

import AuthRoutes from './routes/authRoutes'

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
}

start()



import mongoose, { Connection } from 'mongoose'

export const connectDB = async(MONGODB_URI: string): Promise<Connection>  => {
    try {
        await mongoose.connect(MONGODB_URI)
        console.log(`[db connectDB] Successfully connected to DataBase`)
        return mongoose.connection 
    }catch(err: any){
        console.log(`[db connectDB] Error: Error connecting to db`)
        throw(err)
    }
}

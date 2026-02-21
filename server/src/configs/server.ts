import express, { Express } from 'express';


export const startServer =  async (PORT: number): Promise<Express> =>{

    const app: Express  = express()
    app.use(express.json())
       
    await new Promise<void>((resolve, reject) => {
        const server = app.listen(PORT, () => {
            console.log(`[Server StartServer: Server Running on port ${PORT}]`)
            resolve()
        })
    
        server.on('error', (err: any) => {
            console.log(`[Server StartServer: Error Starting Server ${err}]`)
            reject(err)
        })
    })

    return app
 }











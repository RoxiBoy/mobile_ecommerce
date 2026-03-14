import express, { Express } from 'express';

const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:19006',
  'http://127.0.0.1:19006',
];

const parseOrigins = () => {
  const raw = process.env.CORS_ORIGINS;
  if (!raw) return defaultOrigins;
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const startServer =  async (PORT: number): Promise<Express> =>{

    const app: Express  = express()
    app.use(express.json())
    app.use((req, res, next) => {
        const origin = req.headers.origin as string | undefined;
        const allowedOrigins = parseOrigins();
        if (origin && allowedOrigins.includes(origin)) {
            res.header('Access-Control-Allow-Origin', origin);
            res.header('Vary', 'Origin');
        }
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');

        if (req.method === 'OPTIONS') {
            return res.sendStatus(204);
        }
        next();
    })
       
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










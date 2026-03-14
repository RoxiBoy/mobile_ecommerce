import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import UserModel, { IUser } from '../models/User'
import { AuthRequest } from '../utils/authRequestI'

const JWT_SECRET = process.env.JWT_SECRET ? process.env.JWT_SECRET.toString() : 'asdf'

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;
    
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(" ")[1]

            if(!token){
                return res.status(401).json({
                    status: "Failed",
                    message: "No auth token, access denied"
                })
            }

            const decodedToken = jwt.verify(token, JWT_SECRET) 

            if ( typeof decodedToken === "object" && decodedToken !== null && "id" in decodedToken) {
                const { id } = decodedToken as { id: string }

                const user = await UserModel.findById(id).select("-passwordHash")

                if (!user){
                    return res.status(404).json({
                        status: "Failed",
                        message: "No user found"
                    })
                }

                req.user = user
                next()

            }else {

                return res.status(401).json({
                    status: 'Failed',
                    message: "Invalid auth token, access denied"
                })

            }

        }catch(err) {
            console.log('[protect Middleware] Error', err)
            return res.status(401).json({
                status: 'Failed',
                message: "Invalid auth token, access denied"
            })
        }
    }else {
         return res.status(401).json({
            status: "Failed",
            message: "No auth token, access denied"
        })
    }
}

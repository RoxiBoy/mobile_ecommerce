import User, { IUser }from '../models/User'
import { Request } from 'express'

export interface AuthRequest extends Request {
    user?: IUser
}


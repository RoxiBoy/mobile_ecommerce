import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { generateToken } from '../utils/generateToken'

import User from '../models/User'
import { throws } from 'node:assert'
import { info } from 'node:console'

export const regesterUser = async(req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        const userExists  = await User.findOne({email: email})

        if(userExists !== null) {
            return res.status(400).json({
                'status': 'Failed',
                'message': 'User with the same email exists already!'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({ email: email, name: name, passwordHash: String(hashedPassword)})

        const JWT_TOKEN: string  = generateToken(user._id.toString())

        res.status(200).json({
            'status': 'Success',
            'message': 'Registration Successful',
            'user': {
                'name': name,
                'email': email
            },
            "token": JWT_TOKEN
        })

    }catch(error){
        res.status(500).json({
            'status': 'Failed',
            'message': 'Internal Server Error'
        })
    }
}


export const loginUser = async(req: Request, res: Response) => {
    
    try {
        const { email, password } = req.body

        const user = await User.findOne({email: email})

        if (user == null) {
            return res.status(401).json({
                'status': 'Failed',
                'message': 'Wrong email or password'
            })
        }
        const isMatch = await bcrypt.compare(password, user?.passwordHash)

        if(!isMatch){
            res.status(401).json({
                'status': 'Failed',
                'message': 'Wrong email or password'
            })
        }

        const JWT_TOKEN: string  = generateToken(user._id.toString())

        res.status(200).json({
            status: 'Success',
            message: 'Login Successfull!',
            user: {
                _id: user?._id,
                name: user?.name,
                email: user?.email,
            },
            token: JWT_TOKEN
        })

    }catch(err){
        res.status(500).json({
            'status': 'Failed',
            'message': 'Internal Server Error'
        })    
    }
}














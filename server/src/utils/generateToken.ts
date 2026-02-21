import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ? String(process.env.JWT_SECRET) : 'asdf'

export const generateToken = (id: String) => {
    return jwt.sign({id}, JWT_SECRET , { expiresIn: "30d" })
};

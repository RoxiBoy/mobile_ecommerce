import { Router } from "express";
import { regesterUser , loginUser } from "../controllers/authControllers";

const router = Router()

router.post('/register', regesterUser)
router.post('/login', loginUser)

export default router










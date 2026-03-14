import { Router } from "express";
import { proxyImage } from "../controllers/mediaControllers";

const router = Router();

router.get("/", proxyImage);

export default router;

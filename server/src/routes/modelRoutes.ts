import { Router } from "express";
import { listGeminiModels } from "../controllers/modelControllers";
import { protect } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/isAdmin";

const router = Router();

router.get("/gemini", protect, isAdmin, listGeminiModels);

export default router;

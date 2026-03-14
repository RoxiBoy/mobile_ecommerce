import { Router } from "express";
import { chatWithAssistant } from "../controllers/chatControllers";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/", protect, chatWithAssistant);

export default router;

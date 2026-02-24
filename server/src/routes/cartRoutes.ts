import { Router } from "express";
import {
  addOrUpdateCartItem,
  clearMyCart,
  getMyCart,
  removeCartItem,
} from "../controllers/cartControllers";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);
router.get("/me", getMyCart);
router.post("/item", addOrUpdateCartItem);
router.delete("/item/:productId", removeCartItem);
router.delete("/me", clearMyCart);

export default router;

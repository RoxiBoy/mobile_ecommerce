import { Router } from "express";
import {
  clearWishlist,
  getMyWishlist,
  removeWishlistProduct,
  toggleWishlistProduct,
} from "../controllers/wishlistControllers";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);
router.get("/me", getMyWishlist);
router.post("/toggle/:productId", toggleWishlistProduct);
router.delete("/:productId", removeWishlistProduct);
router.delete("/me", clearWishlist);

export default router;

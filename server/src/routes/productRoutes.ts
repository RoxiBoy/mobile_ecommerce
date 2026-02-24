import { Router } from "express";
import {
  addProductReview,
  createProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductById,
  getProducts,
  updateProduct,
} from "../controllers/productControllers";
import { protect } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/isAdmin";

const router = Router();

router.get("/", getProducts);
router.get("/featured/list", getFeaturedProducts);
router.get("/:id", getProductById);
router.post("/", protect, isAdmin, createProduct);
router.put("/:id", protect, isAdmin, updateProduct);
router.delete("/:id", protect, isAdmin, deleteProduct);
router.post("/:id/reviews", protect, addProductReview);

export default router;

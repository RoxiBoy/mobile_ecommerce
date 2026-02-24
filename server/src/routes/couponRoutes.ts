import { Router } from "express";
import {
  createCoupon,
  deleteCoupon,
  getCouponById,
  getCoupons,
  updateCoupon,
  validateCoupon,
} from "../controllers/couponControllers";
import { protect } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/isAdmin";

const router = Router();

router.get("/validate/:code", validateCoupon);

router.use(protect, isAdmin);
router.get("/", getCoupons);
router.get("/:id", getCouponById);
router.post("/", createCoupon);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

export default router;

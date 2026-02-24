import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  markOrderPaid,
  updateOrderStatus,
} from "../controllers/orderControllers";
import { protect } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/isAdmin";

const router = Router();

router.use(protect);
router.post("/", createOrder);
router.get("/mine", getMyOrders);
router.put("/:id/pay", markOrderPaid);
router.get("/:id", getOrderById);

router.get("/", isAdmin, getOrders);
router.put("/:id/status", isAdmin, updateOrderStatus);

export default router;

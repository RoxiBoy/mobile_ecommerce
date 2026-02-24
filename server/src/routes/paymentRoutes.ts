import { Router } from "express";
import {
  createPayment,
  getAllPayments,
  getMyPayments,
  getPaymentsByOrder,
  updatePaymentStatus,
} from "../controllers/paymentControllers";
import { protect } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/isAdmin";

const router = Router();

router.use(protect);
router.post("/", createPayment);
router.get("/mine", getMyPayments);
router.get("/order/:orderId", getPaymentsByOrder);
router.get("/", isAdmin, getAllPayments);
router.put("/:id/status", isAdmin, updatePaymentStatus);

export default router;

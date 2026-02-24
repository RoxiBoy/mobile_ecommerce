import { Router } from "express";
import {
  createNotification,
  deleteNotification,
  getMyNotifications,
  getNotificationsByUser,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notificationControllers";
import { protect } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/isAdmin";

const router = Router();

router.use(protect);
router.get("/mine", getMyNotifications);
router.patch("/mine/read-all", markAllNotificationsAsRead);
router.patch("/:id/read", markNotificationAsRead);
router.delete("/:id", deleteNotification);

router.post("/", isAdmin, createNotification);
router.get("/user/:userId", isAdmin, getNotificationsByUser);

export default router;

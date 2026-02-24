import { Request, Response } from "express";
import Notification from "../models/Notification";
import { AuthRequest } from "../utils/authRequestI";

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { user, title, message, type } = req.body;
    if (!user || !title || !message) {
      return res.status(400).json({
        status: "Failed",
        message: "user, title and message are required",
      });
    }

    const notification = await Notification.create({ user, title, message, type });
    return res.status(201).json({ status: "Success", data: notification });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "Failed", message: "Not authorized" });
    }

    const notifications = await Notification.find({ user: req.user._id }).sort("-createdAt");
    return res.status(200).json({
      status: "Success",
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const markNotificationAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "Failed", message: "Not authorized" });
    }

    const notification = await Notification.findById(String(req.params.id));
    if (!notification) {
      return res.status(404).json({ status: "Failed", message: "Notification not found" });
    }

    const isOwner = notification.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ status: "Failed", message: "Forbidden" });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({ status: "Success", data: notification });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const markAllNotificationsAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "Failed", message: "Not authorized" });
    }

    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    return res.status(200).json({
      status: "Success",
      message: "All notifications marked as read",
    });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "Failed", message: "Not authorized" });
    }

    const notification = await Notification.findById(String(req.params.id));
    if (!notification) {
      return res.status(404).json({ status: "Failed", message: "Notification not found" });
    }

    const isOwner = notification.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ status: "Failed", message: "Forbidden" });
    }

    await notification.deleteOne();
    return res.status(200).json({ status: "Success", message: "Notification deleted" });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const getNotificationsByUser = async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.userId);
    const notifications = await Notification.find({ user: userId }).sort("-createdAt");
    return res.status(200).json({
      status: "Success",
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

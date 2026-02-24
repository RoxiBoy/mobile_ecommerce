import { Response } from "express";
import mongoose from "mongoose";
import Order from "../models/Order";
import { AuthRequest } from "../utils/authRequestI";

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "Failed", message: "Not authorized" });
    }

    const {
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice = 0,
      shippingPrice = 0,
      totalPrice,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ status: "Failed", message: "Order items are required" });
    }
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        status: "Failed",
        message: "shippingAddress and paymentMethod are required",
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    return res.status(201).json({
      status: "Success",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "Failed", message: "Not authorized" });
    }

    const orders = await Order.find({ user: req.user._id }).sort("-createdAt");

    return res.status(200).json({
      status: "Success",
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "Failed", message: "Not authorized" });
    }

    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "Failed", message: "Invalid order id" });
    }

    const order = await Order.findById(id).populate("user", "name email");
    if (!order) {
      return res.status(404).json({ status: "Failed", message: "Order not found" });
    }

    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdminUser = req.user.role === "admin";
    if (!isOwner && !isAdminUser) {
      return res.status(403).json({ status: "Failed", message: "Forbidden" });
    }

    return res.status(200).json({
      status: "Success",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const getOrders = async (_req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort("-createdAt");

    return res.status(200).json({
      status: "Success",
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { orderStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "Failed", message: "Invalid order id" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ status: "Failed", message: "Order not found" });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      if (orderStatus === "paid") {
        order.isPaid = true;
        order.paidAt = new Date();
      }
      if (orderStatus === "delivered") {
        order.isDelivered = true;
        order.deliveredAt = new Date();
      }
    }

    await order.save();

    return res.status(200).json({
      status: "Success",
      message: "Order status updated",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const markOrderPaid = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "Failed", message: "Not authorized" });
    }

    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "Failed", message: "Invalid order id" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ status: "Failed", message: "Order not found" });
    }

    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdminUser = req.user.role === "admin";
    if (!isOwner && !isAdminUser) {
      return res.status(403).json({ status: "Failed", message: "Forbidden" });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    if (order.orderStatus === "pending") {
      order.orderStatus = "paid";
    }
    await order.save();

    return res.status(200).json({
      status: "Success",
      message: "Order marked as paid",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

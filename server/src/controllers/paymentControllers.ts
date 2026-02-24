import { Response } from "express";
import mongoose from "mongoose";
import Payment from "../models/Payment";
import Order from "../models/Order";
import { AuthRequest } from "../utils/authRequestI";

export const createPayment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "Failed", message: "Not authorized" });
    }

    const { order, paymentProvider, transactionId, amount, status } = req.body;
    if (!order || !paymentProvider || !transactionId || amount === undefined || !status) {
      return res.status(400).json({
        status: "Failed",
        message: "order, paymentProvider, transactionId, amount and status are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(String(order))) {
      return res.status(400).json({ status: "Failed", message: "Invalid order id" });
    }

    const orderDoc = await Order.findById(order);
    if (!orderDoc) {
      return res.status(404).json({ status: "Failed", message: "Order not found" });
    }

    const isOwner = orderDoc.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ status: "Failed", message: "Forbidden" });
    }

    const payment = await Payment.create({
      user: req.user._id,
      order,
      paymentProvider,
      transactionId,
      amount,
      status,
    });

    if (status === "paid") {
      orderDoc.isPaid = true;
      orderDoc.paidAt = new Date();
      if (orderDoc.orderStatus === "pending") {
        orderDoc.orderStatus = "paid";
      }
      await orderDoc.save();
    }

    return res.status(201).json({ status: "Success", data: payment });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const getMyPayments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "Failed", message: "Not authorized" });
    }

    const payments = await Payment.find({ user: req.user._id }).populate("order").sort("-createdAt");
    return res.status(200).json({ status: "Success", count: payments.length, data: payments });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const getPaymentsByOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "Failed", message: "Not authorized" });
    }

    const orderId = String(req.params.orderId);
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ status: "Failed", message: "Invalid order id" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ status: "Failed", message: "Order not found" });
    }

    const isOwner = order.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ status: "Failed", message: "Forbidden" });
    }

    const payments = await Payment.find({ order: orderId }).sort("-createdAt");
    return res.status(200).json({ status: "Success", count: payments.length, data: payments });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const getAllPayments = async (_req: AuthRequest, res: Response) => {
  try {
    const payments = await Payment.find()
      .populate("user", "name email")
      .populate("order")
      .sort("-createdAt");

    return res.status(200).json({ status: "Success", count: payments.length, data: payments });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const updatePaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "Failed", message: "Invalid payment id" });
    }
    if (!status) {
      return res.status(400).json({ status: "Failed", message: "status is required" });
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ status: "Failed", message: "Payment not found" });
    }

    payment.status = status;
    await payment.save();

    if (status === "paid") {
      const order = await Order.findById(payment.order);
      if (order) {
        order.isPaid = true;
        order.paidAt = new Date();
        if (order.orderStatus === "pending") {
          order.orderStatus = "paid";
        }
        await order.save();
      }
    }

    return res.status(200).json({
      status: "Success",
      message: "Payment status updated",
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

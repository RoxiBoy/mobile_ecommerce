import { Request, Response } from "express";
import mongoose from "mongoose";
import Coupon from "../models/Coupon";

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const { code, discountType, discountValue, expiryDate } = req.body;

    if (!code || !discountType || discountValue === undefined || !expiryDate) {
      return res.status(400).json({
        status: "Failed",
        message: "code, discountType, discountValue and expiryDate are required",
      });
    }

    const exists = await Coupon.findOne({ code: String(code).toUpperCase() });
    if (exists) {
      return res.status(400).json({ status: "Failed", message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      ...req.body,
      code: String(code).toUpperCase(),
    });

    return res.status(201).json({ status: "Success", data: coupon });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const getCoupons = async (_req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find().sort("-createdAt");
    return res.status(200).json({ status: "Success", count: coupons.length, data: coupons });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const getCouponById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "Failed", message: "Invalid coupon id" });
    }
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ status: "Failed", message: "Coupon not found" });
    }
    return res.status(200).json({ status: "Success", data: coupon });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "Failed", message: "Invalid coupon id" });
    }

    const payload = { ...req.body };
    if (payload.code) {
      payload.code = String(payload.code).toUpperCase();
    }

    const coupon = await Coupon.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
    if (!coupon) {
      return res.status(404).json({ status: "Failed", message: "Coupon not found" });
    }

    return res.status(200).json({ status: "Success", data: coupon });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "Failed", message: "Invalid coupon id" });
    }
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({ status: "Failed", message: "Coupon not found" });
    }
    return res.status(200).json({ status: "Success", message: "Coupon deleted" });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const code = String(req.params.code);
    const amount = Number(req.query.amount ?? 0);

    const coupon = await Coupon.findOne({ code: String(code).toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ status: "Failed", message: "Coupon not found or inactive" });
    }

    if (coupon.expiryDate < new Date()) {
      return res.status(400).json({ status: "Failed", message: "Coupon expired" });
    }

    if (coupon.minPurchase && amount < coupon.minPurchase) {
      return res.status(400).json({
        status: "Failed",
        message: `Minimum purchase for this coupon is ${coupon.minPurchase}`,
      });
    }

    const discount =
      coupon.discountType === "percentage"
        ? (amount * coupon.discountValue) / 100
        : coupon.discountValue;

    return res.status(200).json({
      status: "Success",
      data: {
        coupon,
        amount,
        discount,
        finalAmount: Math.max(amount - discount, 0),
      },
    });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

import { Response } from "express";
import Wishlist from "../models/Wishlist";
import Product from "../models/Product";
import { AuthRequest } from "../utils/authRequestI";

export const getMyWishlist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "Failed", message: "Not authorized" });
    }

    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products",
      "name price discountPrice images stock rating numReviews"
    );

    return res.status(200).json({
      status: "Success",
      data: wishlist ?? { user: req.user._id, products: [] },
    });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const toggleWishlistProduct = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "Failed", message: "Not authorized" });
    }

    const productId = String(req.params.productId);
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ status: "Failed", message: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const existingIndex = wishlist.products.findIndex((id) => id.toString() === productId);
    if (existingIndex >= 0) {
      wishlist.products.splice(existingIndex, 1);
    } else {
      wishlist.products.push(product._id);
    }

    await wishlist.save();
    const populatedWishlist = await Wishlist.findById(wishlist._id).populate(
      "products",
      "name price discountPrice images stock rating numReviews"
    );

    return res.status(200).json({
      status: "Success",
      message: existingIndex >= 0 ? "Removed from wishlist" : "Added to wishlist",
      data: populatedWishlist,
    });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const removeWishlistProduct = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "Failed", message: "Not authorized" });
    }

    const productId = String(req.params.productId);
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ status: "Failed", message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();

    return res.status(200).json({
      status: "Success",
      message: "Removed from wishlist",
      data: wishlist,
    });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const clearWishlist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "Failed", message: "Not authorized" });
    }

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ status: "Failed", message: "Wishlist not found" });
    }

    wishlist.products = [];
    await wishlist.save();

    return res.status(200).json({
      status: "Success",
      message: "Wishlist cleared",
      data: wishlist,
    });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

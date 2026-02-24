import { Response } from "express";
import Cart from "../models/Cart";
import Product from "../models/Product";
import { AuthRequest } from "../utils/authRequestI";

const calculateCartTotal = (items: { quantity: number; priceAtTime: number }[]) => {
  return items.reduce((sum, item) => sum + item.quantity * item.priceAtTime, 0);
};

export const getMyCart = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "Failed", message: "Not authorized" });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product", "name images");

    return res.status(200).json({
      status: "Success",
      data: cart ?? { user: req.user._id, items: [], totalPrice: 0 },
    });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const addOrUpdateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "Failed", message: "Not authorized" });
    }

    const { product: productId, quantity, selectedVariant } = req.body;

    if (!productId || !quantity || Number(quantity) < 1) {
      return res.status(400).json({
        status: "Failed",
        message: "product and quantity (>= 1) are required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ status: "Failed", message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalPrice: 0,
      });
    }

    const priceAtTime = product.discountPrice ?? product.price;
    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        (item.selectedVariant ?? "") === (selectedVariant ?? "")
    );

    if (existingItem) {
      existingItem.quantity = Number(quantity);
      existingItem.priceAtTime = priceAtTime;
    } else {
      cart.items.push({
        product: product._id,
        quantity: Number(quantity),
        selectedVariant,
        priceAtTime,
      });
    }

    cart.totalPrice = calculateCartTotal(cart.items);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate("items.product", "name images");
    return res.status(200).json({
      status: "Success",
      message: "Cart updated",
      data: populatedCart,
    });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const removeCartItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "Failed", message: "Not authorized" });
    }

    const productId = String(req.params.productId);
    const selectedVariant = req.query.selectedVariant ? String(req.query.selectedVariant) : "";

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ status: "Failed", message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.product.toString() === productId &&
          (item.selectedVariant ?? "") === selectedVariant
        )
    );

    cart.totalPrice = calculateCartTotal(cart.items);
    await cart.save();

    return res.status(200).json({
      status: "Success",
      message: "Item removed from cart",
      data: cart,
    });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

export const clearMyCart = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "Failed", message: "Not authorized" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ status: "Failed", message: "Cart not found" });
    }

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    return res.status(200).json({
      status: "Success",
      message: "Cart cleared",
      data: cart,
    });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

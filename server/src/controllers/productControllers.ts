import { Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/Product";
import Category from "../models/Category";
import { AuthRequest } from "../utils/authRequestI";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!name || !description || price === undefined || !category || stock === undefined) {
      return res.status(400).json({
        status: "Failed",
        message: "name, description, price, category and stock are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(String(category))) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid category id",
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        status: "Failed",
        message: "Category not found",
      });
    }

    const product = await Product.create(req.body);

    return res.status(201).json({
      status: "Success",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      category,
      featured,
      search,
      minPrice,
      maxPrice,
      page = "1",
      limit = "10",
      sort = "-createdAt",
    } = req.query;

    const query: Record<string, unknown> = {};

    if (category && mongoose.Types.ObjectId.isValid(String(category))) {
      query.category = category;
    }
    if (featured === "true") {
      query.isFeatured = true;
    }
    if (search) {
      query.name = { $regex: String(search), $options: "i" };
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        (query.price as { $gte?: number; $lte?: number }).$gte = Number(minPrice);
      }
      if (maxPrice) {
        (query.price as { $gte?: number; $lte?: number }).$lte = Number(maxPrice);
      }
    }

    const currentPage = Math.max(Number(page), 1);
    const currentLimit = Math.max(Number(limit), 1);
    const skip = (currentPage - 1) * currentLimit;

    const [products, total] = await Promise.all([
      Product.find(query).populate("category", "name").sort(String(sort)).skip(skip).limit(currentLimit),
      Product.countDocuments(query),
    ]);

    return res.status(200).json({
      status: "Success",
      count: products.length,
      total,
      page: currentPage,
      pages: Math.ceil(total / currentLimit),
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });
  }
};

export const getFeaturedProducts = async (_req: Request, res: Response) => {
  try {
    const products = await Product.find({ isFeatured: true })
      .populate("category", "name")
      .sort("-createdAt");

    return res.status(200).json({
      status: "Success",
      count: products.length,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid product id",
      });
    }

    const product = await Product.findById(id).populate("category", "name").populate("reviews.user", "name");

    if (!product) {
      return res.status(404).json({
        status: "Failed",
        message: "Product not found",
      });
    }

    return res.status(200).json({
      status: "Success",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid product id",
      });
    }

    if (req.body.category && !mongoose.Types.ObjectId.isValid(String(req.body.category))) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid category id",
      });
    }

    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("category", "name");

    if (!product) {
      return res.status(404).json({
        status: "Failed",
        message: "Product not found",
      });
    }

    return res.status(200).json({
      status: "Success",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid product id",
      });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        status: "Failed",
        message: "Product not found",
      });
    }

    return res.status(200).json({
      status: "Success",
      message: "Product deleted",
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });
  }
};

export const addProductReview = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { rating, comment } = req.body;

    if (!req.user) {
      return res.status(401).json({
        status: "Failed",
        message: "Not authorized",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid product id",
      });
    }

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        status: "Failed",
        message: "rating must be between 1 and 5",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        status: "Failed",
        message: "Product not found",
      });
    }

    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user?._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({
        status: "Failed",
        message: "You already reviewed this product",
      });
    }

    product.reviews.push({
      user: req.user._id,
      rating: Number(rating),
      comment,
    });
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length;

    await product.save();

    return res.status(201).json({
      status: "Success",
      message: "Review added",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });
  }
};

import { Request, Response } from "express";
import mongoose from "mongoose";
import Category from "../models/Category";

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, image, parentCategory } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "Failed",
        message: "Category name is required",
      });
    }

    const category = await Category.create({ name, image, parentCategory });

    return res.status(201).json({
      status: "Success",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });
  }
};

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find().populate("parentCategory", "name");

    return res.status(200).json({
      status: "Success",
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid category id",
      });
    }

    const category = await Category.findById(id).populate("parentCategory", "name");

    if (!category) {
      return res.status(404).json({
        status: "Failed",
        message: "Category not found",
      });
    }

    return res.status(200).json({
      status: "Success",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid category id",
      });
    }

    const category = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({
        status: "Failed",
        message: "Category not found",
      });
    }

    return res.status(200).json({
      status: "Success",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid category id",
      });
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        status: "Failed",
        message: "Category not found",
      });
    }

    return res.status(200).json({
      status: "Success",
      message: "Category deleted",
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });
  }
};

import { Response, NextFunction } from "express";
import { AuthRequest } from "../utils/authRequestI"; 

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    return next();
  } else {
    return res.status(403).json({
      status: "Failed",
      message: "Admin access only",
    });
  }
};

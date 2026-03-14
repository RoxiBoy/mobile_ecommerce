export interface User {
  _id?: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  user: User;
  token: string;
}

export interface Category {
  _id: string;
  name: string;
  image?: string;
  parentCategory?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string | { _id: string; name: string };
  brand?: string;
  stock: number;
  isFeatured: boolean;
  rating: number;
  numReviews: number;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchase?: number;
  expiryDate: string;
  isActive: boolean;
}

export interface Order {
  _id: string;
  user:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };
  totalPrice: number;
  orderStatus: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  isPaid: boolean;
  isDelivered: boolean;
  createdAt: string;
}

export interface Payment {
  _id: string;
  user:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };
  order: string | { _id: string };
  paymentProvider: string;
  transactionId: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  user: string;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
}

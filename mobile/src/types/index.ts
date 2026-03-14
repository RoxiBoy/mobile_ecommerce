export type ApiStatus = "Success" | "Failed";

export interface ApiError {
  status: ApiStatus;
  message: string;
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  role?: "customer" | "admin";
}

export interface AuthResponse {
  status: ApiStatus;
  message: string;
  user: User;
  token: string;
}

export interface Category {
  _id: string;
  name: string;
  image?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category?: Category | string;
  brand?: string;
  stock: number;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
}

export interface CartItem {
  product: Product | string;
  quantity: number;
  selectedVariant?: string;
  priceAtTime: number;
}

export interface Cart {
  _id?: string;
  user: string;
  items: CartItem[];
  totalPrice: number;
}

export interface Wishlist {
  _id?: string;
  user: string;
  products: Product[];
}

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  selectedVariant?: string;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  shippingAddress: Record<string, unknown>;
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  orderStatus: OrderStatus;
  isPaid: boolean;
  isDelivered: boolean;
  createdAt: string;
}

export interface CouponValidation {
  coupon: {
    _id: string;
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
  };
  amount: number;
  discount: number;
  finalAmount: number;
}

export interface Payment {
  _id: string;
  order: string;
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

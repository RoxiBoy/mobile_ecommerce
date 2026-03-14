import { apiRequest } from "./api";
import {
  AuthResponse,
  Category,
  Coupon,
  NotificationItem,
  Order,
  Payment,
  Product,
} from "@/types";

interface DataResponse<T> {
  status: string;
  message?: string;
  data: T;
}

interface ListResponse<T> {
  status: string;
  count: number;
  data: T[];
}

export const authService = {
  login: (email: string, password: string) =>
    apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),
};

export const adminCategoryService = {
  list: () => apiRequest<ListResponse<Category>>("/categories").then((res) => res.data),
  create: (token: string, payload: { name: string; image?: string; parentCategory?: string }) =>
    apiRequest<DataResponse<Category>>("/categories", {
      method: "POST",
      token,
      body: payload,
    }).then((res) => res.data),
  update: (token: string, id: string, payload: Partial<Category>) =>
    apiRequest<DataResponse<Category>>(`/categories/${id}`, {
      method: "PUT",
      token,
      body: payload,
    }).then((res) => res.data),
  remove: (token: string, id: string) =>
    apiRequest(`/categories/${id}`, {
      method: "DELETE",
      token,
    }),
};

export const adminProductService = {
  list: () =>
    apiRequest<ListResponse<Product>>("/products", {
      query: { page: 1, limit: 100 },
    }).then((res) => res.data),
  create: (
    token: string,
    payload: {
      name: string;
      description: string;
      price: number;
      category: string;
      stock: number;
      discountPrice?: number;
      images?: string[];
      brand?: string;
      isFeatured?: boolean;
    }
  ) =>
    apiRequest<DataResponse<Product>>("/products", {
      method: "POST",
      token,
      body: payload,
    }).then((res) => res.data),
  update: (token: string, id: string, payload: Partial<Product>) =>
    apiRequest<DataResponse<Product>>(`/products/${id}`, {
      method: "PUT",
      token,
      body: payload,
    }).then((res) => res.data),
  remove: (token: string, id: string) =>
    apiRequest(`/products/${id}`, {
      method: "DELETE",
      token,
    }),
};

export const adminCouponService = {
  list: (token: string) =>
    apiRequest<ListResponse<Coupon>>("/coupons", {
      token,
    }).then((res) => res.data),
  create: (
    token: string,
    payload: {
      code: string;
      discountType: "percentage" | "fixed";
      discountValue: number;
      minPurchase?: number;
      expiryDate: string;
      isActive?: boolean;
    }
  ) =>
    apiRequest<DataResponse<Coupon>>("/coupons", {
      method: "POST",
      token,
      body: payload,
    }).then((res) => res.data),
  update: (token: string, id: string, payload: Partial<Coupon>) =>
    apiRequest<DataResponse<Coupon>>(`/coupons/${id}`, {
      method: "PUT",
      token,
      body: payload,
    }).then((res) => res.data),
  remove: (token: string, id: string) =>
    apiRequest(`/coupons/${id}`, {
      method: "DELETE",
      token,
    }),
};

export const adminOrderService = {
  list: (token: string) =>
    apiRequest<ListResponse<Order>>("/orders", {
      token,
    }).then((res) => res.data),
  updateStatus: (
    token: string,
    id: string,
    orderStatus: "pending" | "paid" | "shipped" | "delivered" | "cancelled"
  ) =>
    apiRequest(`/orders/${id}/status`, {
      method: "PUT",
      token,
      body: { orderStatus },
    }),
};

export const adminPaymentService = {
  list: (token: string) =>
    apiRequest<ListResponse<Payment>>("/payments", {
      token,
    }).then((res) => res.data),
  updateStatus: (token: string, id: string, status: string) =>
    apiRequest(`/payments/${id}/status`, {
      method: "PUT",
      token,
      body: { status },
    }),
};

export const adminNotificationService = {
  create: (token: string, payload: { user: string; title: string; message: string; type?: string }) =>
    apiRequest("/notifications", {
      method: "POST",
      token,
      body: payload,
    }),
  byUser: (token: string, userId: string) =>
    apiRequest<ListResponse<NotificationItem>>(`/notifications/user/${userId}`, {
      token,
    }).then((res) => res.data),
};

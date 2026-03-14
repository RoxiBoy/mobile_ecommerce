import {
  AuthResponse,
  Cart,
  Category,
  CouponValidation,
  NotificationItem,
  Order,
  Payment,
  Product,
  Wishlist,
} from "@/src/types";
import { apiRequest } from "./api";

interface DataResponse<T> {
  status: string;
  message?: string;
  data: T;
}

interface ListResponse<T> {
  status: string;
  count: number;
  total?: number;
  page?: number;
  pages?: number;
  data: T[];
}

export const authService = {
  login: (email: string, password: string) =>
    apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),
  register: (name: string, email: string, password: string) =>
    apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: { name, email, password },
    }),
};

export const catalogService = {
  categories: () =>
    apiRequest<ListResponse<Category>>("/categories").then((res) => res.data),
  products: (params?: {
    search?: string;
    category?: string;
    featured?: boolean;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sort?: string;
  }) =>
    apiRequest<ListResponse<Product>>("/products", {
      query: {
        search: params?.search,
        category: params?.category,
        featured: params?.featured,
        minPrice: params?.minPrice,
        maxPrice: params?.maxPrice,
        page: params?.page,
        limit: params?.limit,
        sort: params?.sort,
      },
    }),
  featured: () =>
    apiRequest<ListResponse<Product>>("/products/featured/list").then((res) => res.data),
  productById: (id: string) =>
    apiRequest<DataResponse<Product>>(`/products/${id}`).then((res) => res.data),
  addReview: (id: string, token: string, rating: number, comment?: string) =>
    apiRequest(`/products/${id}/reviews`, {
      method: "POST",
      token,
      body: { rating, comment },
    }),
};

export const cartService = {
  mine: (token: string) =>
    apiRequest<DataResponse<Cart>>("/cart/me", { token }).then((res) => res.data),
  upsertItem: (
    token: string,
    payload: { product: string; quantity: number; selectedVariant?: string }
  ) =>
    apiRequest<DataResponse<Cart>>("/cart/item", {
      method: "POST",
      token,
      body: payload,
    }).then((res) => res.data),
  removeItem: (token: string, productId: string, selectedVariant?: string) =>
    apiRequest(`/cart/item/${productId}`, {
      method: "DELETE",
      token,
      query: { selectedVariant },
    }),
  clear: (token: string) =>
    apiRequest("/cart/me", {
      method: "DELETE",
      token,
    }),
};

export const wishlistService = {
  mine: (token: string) =>
    apiRequest<DataResponse<Wishlist>>("/wishlist/me", { token }).then((res) => res.data),
  toggle: (token: string, productId: string) =>
    apiRequest(`/wishlist/toggle/${productId}`, {
      method: "POST",
      token,
    }),
  clear: (token: string) =>
    apiRequest("/wishlist/me", {
      method: "DELETE",
      token,
    }),
};

export const orderService = {
  mine: (token: string) =>
    apiRequest<ListResponse<Order>>("/orders/mine", { token }).then((res) => res.data),
  create: (
    token: string,
    payload: {
      items: {
        product: string;
        name: string;
        image: string;
        quantity: number;
        price: number;
        selectedVariant?: string;
      }[];
      shippingAddress: Record<string, string>;
      paymentMethod: string;
      itemsPrice: number;
      taxPrice: number;
      shippingPrice: number;
      totalPrice: number;
    }
  ) =>
    apiRequest<DataResponse<Order>>("/orders", {
      method: "POST",
      token,
      body: payload,
    }).then((res) => res.data),
  markPaid: (token: string, orderId: string) =>
    apiRequest(`/orders/${orderId}/pay`, {
      method: "PUT",
      token,
    }),
};

export const couponService = {
  validate: (code: string, amount: number) =>
    apiRequest<DataResponse<CouponValidation>>(`/coupons/validate/${code}`, {
      query: { amount },
    }).then((res) => res.data),
};

export const paymentService = {
  mine: (token: string) =>
    apiRequest<ListResponse<Payment>>("/payments/mine", { token }).then((res) => res.data),
  create: (
    token: string,
    payload: {
      order: string;
      paymentProvider: string;
      transactionId: string;
      amount: number;
      status: string;
    }
  ) =>
    apiRequest("/payments", {
      method: "POST",
      token,
      body: payload,
    }),
};

export const notificationService = {
  mine: (token: string) =>
    apiRequest<ListResponse<NotificationItem>>("/notifications/mine", { token }).then(
      (res) => res.data
    ),
  markAllRead: (token: string) =>
    apiRequest("/notifications/mine/read-all", {
      method: "PATCH",
      token,
    }),
  markRead: (token: string, notificationId: string) =>
    apiRequest(`/notifications/${notificationId}/read`, {
      method: "PATCH",
      token,
    }),
  remove: (token: string, notificationId: string) =>
    apiRequest(`/notifications/${notificationId}`, {
      method: "DELETE",
      token,
    }),
};

export const chatService = {
  send: (token: string, message: string) =>
    apiRequest<{ status: string; reply: string }>("/chat", {
      method: "POST",
      token,
      body: { message },
    }),
};

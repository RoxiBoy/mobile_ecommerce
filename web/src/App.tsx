import { FormEvent, useMemo, useState } from "react";
import {
  adminCategoryService,
  adminCouponService,
  adminNotificationService,
  adminOrderService,
  adminPaymentService,
  adminProductService,
  authService,
} from "@/lib/services";
import {
  Category,
  Coupon,
  NotificationItem,
  Order,
  Payment,
  Product,
  User,
} from "@/types";

type TabKey =
  | "categories"
  | "products"
  | "coupons"
  | "orders"
  | "payments"
  | "notifications";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("products");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    image: "",
  });
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    brand: "",
    stock: "",
    imageUrl: "",
    isFeatured: false,
  });
  const [couponForm, setCouponForm] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    minPurchase: "",
    expiryDate: "",
    isActive: true,
  });
  const [notificationForm, setNotificationForm] = useState({
    user: "",
    title: "",
    message: "",
    type: "",
  });
  const [notificationLookupUserId, setNotificationLookupUserId] = useState("");

  const canUseAdminActions = Boolean(token);

  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c._id, c.name]));
  }, [categories]);

  const showError = (message: string) => {
    setStatus("");
    setError(message);
  };

  const showStatus = (message: string) => {
    setError("");
    setStatus(message);
  };

  const loadCategories = async () => {
    const data = await adminCategoryService.list();
    setCategories(data);
  };

  const loadProducts = async () => {
    const data = await adminProductService.list();
    setProducts(data);
  };

  const loadCoupons = async () => {
    if (!token) return;
    const data = await adminCouponService.list(token);
    setCoupons(data);
  };

  const loadOrders = async () => {
    if (!token) return;
    const data = await adminOrderService.list(token);
    setOrders(data);
  };

  const loadPayments = async () => {
    if (!token) return;
    const data = await adminPaymentService.list(token);
    setPayments(data);
  };

  const loadNotificationsByUser = async (userId: string) => {
    if (!token) return;
    const data = await adminNotificationService.byUser(token, userId);
    setNotifications(data);
  };

  const loadAdminData = async () => {
    try {
      setError("");
      await Promise.all([loadCategories(), loadProducts()]);
      if (token) {
        await Promise.all([loadCoupons(), loadOrders(), loadPayments()]);
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to load data");
    }
  };

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await authService.login(email.trim(), password);
      setToken(res.token);
      setUser(res.user);
      showStatus("Authenticated. Loading admin data...");
      await Promise.all([loadCategories(), loadProducts()]);
      await Promise.all([loadCoupons(), loadOrders(), loadPayments()]);
      showStatus("Admin dashboard ready.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const onLogout = () => {
    setToken(null);
    setUser(null);
    setCoupons([]);
    setOrders([]);
    setPayments([]);
    setNotifications([]);
    showStatus("Logged out.");
  };

  const submitCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      showError("Session missing. Please login again.");
      return;
    }
    if (!categoryForm.name.trim()) {
      showError("Category name is required.");
      return;
    }
    try {
      await adminCategoryService.create(token, {
        name: categoryForm.name.trim(),
        image: categoryForm.image.trim() || undefined,
      });
      setCategoryForm({ name: "", image: "" });
      await loadCategories();
      showStatus("Category created.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Category creation failed");
    }
  };

  const submitProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await adminProductService.create(token, {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: Number(productForm.price),
        discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : undefined,
        category: productForm.category,
        brand: productForm.brand.trim() || undefined,
        stock: Number(productForm.stock),
        images: productForm.imageUrl.trim() ? [productForm.imageUrl.trim()] : [],
        isFeatured: productForm.isFeatured,
      });
      setProductForm({
        name: "",
        description: "",
        price: "",
        discountPrice: "",
        category: "",
        brand: "",
        stock: "",
        imageUrl: "",
        isFeatured: false,
      });
      await loadProducts();
      showStatus("Product created.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Product creation failed");
    }
  };

  const submitCoupon = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await adminCouponService.create(token, {
        code: couponForm.code.trim().toUpperCase(),
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        minPurchase: couponForm.minPurchase ? Number(couponForm.minPurchase) : undefined,
        expiryDate: couponForm.expiryDate,
        isActive: couponForm.isActive,
      });
      setCouponForm({
        code: "",
        discountType: "percentage",
        discountValue: "",
        minPurchase: "",
        expiryDate: "",
        isActive: true,
      });
      await loadCoupons();
      showStatus("Coupon created.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Coupon creation failed");
    }
  };

  const submitNotification = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await adminNotificationService.create(token, {
        user: notificationForm.user.trim(),
        title: notificationForm.title.trim(),
        message: notificationForm.message.trim(),
        type: notificationForm.type.trim() || undefined,
      });
      showStatus("Notification created.");
      setNotificationForm({ user: "", title: "", message: "", type: "" });
    } catch (err) {
      showError(err instanceof Error ? err.message : "Notification creation failed");
    }
  };

  const updateOrderStatus = async (orderId: string) => {
    if (!token) return;
    const nextStatus = window.prompt(
      "Set order status (pending, paid, shipped, delivered, cancelled):",
      "shipped"
    );
    if (!nextStatus) return;
    try {
      await adminOrderService.updateStatus(
        token,
        orderId,
        nextStatus as "pending" | "paid" | "shipped" | "delivered" | "cancelled"
      );
      await loadOrders();
      showStatus("Order status updated.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Order update failed");
    }
  };

  const updatePaymentStatus = async (paymentId: string) => {
    if (!token) return;
    const nextStatus = window.prompt("Set payment status:", "paid");
    if (!nextStatus) return;
    try {
      await adminPaymentService.updateStatus(token, paymentId, nextStatus);
      await loadPayments();
      showStatus("Payment status updated.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Payment update failed");
    }
  };

  const removeCategory = async (id: string) => {
    if (!token) return;
    try {
      await adminCategoryService.remove(token, id);
      await loadCategories();
      showStatus("Category deleted.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const editCategory = async (category: Category) => {
    if (!token) return;
    const name = window.prompt("Category name", category.name);
    if (!name) return;
    const image = window.prompt("Image URL (optional)", category.image || "") || "";
    try {
      await adminCategoryService.update(token, category._id, {
        name,
        image: image || undefined,
      });
      await loadCategories();
      showStatus("Category updated.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Update failed");
    }
  };

  const removeProduct = async (id: string) => {
    if (!token) return;
    try {
      await adminProductService.remove(token, id);
      await loadProducts();
      showStatus("Product deleted.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const editProduct = async (product: Product) => {
    if (!token) return;
    const name = window.prompt("Product name", product.name);
    if (!name) return;
    const priceValue = window.prompt("Price", String(product.price));
    if (!priceValue) return;
    const stockValue = window.prompt("Stock", String(product.stock));
    if (!stockValue) return;
    const imageUrl = window.prompt(
      "Image URL (optional)",
      Array.isArray(product.images) ? product.images[0] || "" : ""
    );
    const isFeatured = window.confirm("Set as featured?");

    try {
      await adminProductService.update(token, product._id, {
        name,
        price: Number(priceValue),
        stock: Number(stockValue),
        isFeatured,
        images: imageUrl && imageUrl.trim().length > 0 ? [imageUrl.trim()] : product.images,
      });
      await loadProducts();
      showStatus("Product updated.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Update failed");
    }
  };

  const removeCoupon = async (id: string) => {
    if (!token) return;
    try {
      await adminCouponService.remove(token, id);
      await loadCoupons();
      showStatus("Coupon deleted.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const editCoupon = async (coupon: Coupon) => {
    if (!token) return;
    const discountValue = window.prompt("Discount value", String(coupon.discountValue));
    if (!discountValue) return;
    const isActive = window.confirm("Keep this coupon active?");
    try {
      await adminCouponService.update(token, coupon._id, {
        discountValue: Number(discountValue),
        isActive,
      });
      await loadCoupons();
      showStatus("Coupon updated.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Update failed");
    }
  };

  if (!token) {
    return (
      <main className="page">
        <section className="auth-wrap">
          <h1 className="auth-title">Admin Control Panel</h1>
          <p className="auth-subtitle">
            Sign in with an admin account to manage categories, products, coupons, orders,
            payments, and notifications.
          </p>

          <form onSubmit={onLogin}>
            <div className="field">
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary" disabled={authLoading} type="submit">
              {authLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {error ? <div className="error">{error}</div> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <h1 className="hero-title">Platform Admin</h1>
          <p className="hero-subtitle">
            Signed in as <strong>{user?.email}</strong>
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-muted" onClick={loadAdminData}>
            Refresh Data
          </button>
          <button className="btn btn-primary" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <nav className="tabs">
        {(
          [
            ["products", "Products"],
            ["categories", "Categories"],
            ["coupons", "Coupons"],
            ["orders", "Orders"],
            ["payments", "Payments"],
            ["notifications", "Notifications"],
          ] as [TabKey, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            className={`tab ${activeTab === key ? "active" : ""}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      {status ? <div className="success">{status}</div> : null}
      {error ? <div className="error">{error}</div> : null}

      {activeTab === "categories" && (
        <section className="grid">
          <article className="panel">
            <h3>Create Category</h3>
            <form className="stack" onSubmit={submitCategory}>
              <input
                placeholder="Category name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm((v) => ({ ...v, name: e.target.value }))}
                required
              />
              <input
                placeholder="Image URL (optional)"
                value={categoryForm.image}
                onChange={(e) => setCategoryForm((v) => ({ ...v, image: e.target.value }))}
              />
              <button className="btn btn-accent" type="submit" disabled={!canUseAdminActions}>
                Save Category
              </button>
            </form>
          </article>

          <article className="panel stack">
            {categories.map((category) => (
              <div key={category._id} className="list-item">
                <strong>{category.name}</strong>
                {category.image ? <div className="list-meta">{category.image}</div> : null}
                <div className="list-actions">
                  <button className="btn btn-accent" onClick={() => editCategory(category)}>
                    Edit
                  </button>
                  <button className="btn btn-muted" onClick={() => removeCategory(category._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </article>
        </section>
      )}

      {activeTab === "products" && (
        <section className="grid">
          <article className="panel">
            <h3>Create Product</h3>
            <form className="stack" onSubmit={submitProduct}>
              <input
                placeholder="Product name"
                value={productForm.name}
                onChange={(e) => setProductForm((v) => ({ ...v, name: e.target.value }))}
                required
              />
              <textarea
                placeholder="Description"
                value={productForm.description}
                onChange={(e) => setProductForm((v) => ({ ...v, description: e.target.value }))}
                required
              />
              <div className="compact-row">
                <input
                  placeholder="Price"
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm((v) => ({ ...v, price: e.target.value }))}
                  required
                />
                <input
                  placeholder="Discount price"
                  type="number"
                  value={productForm.discountPrice}
                  onChange={(e) =>
                    setProductForm((v) => ({ ...v, discountPrice: e.target.value }))
                  }
                />
              </div>
              <div className="compact-row">
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm((v) => ({ ...v, category: e.target.value }))}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Stock"
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm((v) => ({ ...v, stock: e.target.value }))}
                  required
                />
              </div>
              <input
                placeholder="Brand"
                value={productForm.brand}
                onChange={(e) => setProductForm((v) => ({ ...v, brand: e.target.value }))}
              />
              <input
                placeholder="Image URL"
                value={productForm.imageUrl}
                onChange={(e) => setProductForm((v) => ({ ...v, imageUrl: e.target.value }))}
              />
              <label className="label" style={{ marginBottom: 0 }}>
                <input
                  type="checkbox"
                  checked={productForm.isFeatured}
                  onChange={(e) =>
                    setProductForm((v) => ({ ...v, isFeatured: e.target.checked }))
                  }
                  style={{ width: "auto", marginRight: 8 }}
                />
                Featured product
              </label>
              <button className="btn btn-accent" type="submit" disabled={!canUseAdminActions}>
                Save Product
              </button>
            </form>
          </article>

          <article className="panel stack">
            {products.map((product) => {
              const categoryName =
                typeof product.category === "string"
                  ? categoryMap.get(product.category) ?? product.category
                  : product.category?.name || "";

              return (
                <div key={product._id} className="list-item">
                  <strong>{product.name}</strong> {product.isFeatured ? <span className="pill">Featured</span> : null}
                  <div className="list-meta">
                    {categoryName} • ${product.price} • stock {product.stock}
                  </div>
                  <div className="list-actions">
                    <button className="btn btn-accent" onClick={() => editProduct(product)}>
                      Edit
                    </button>
                    <button className="btn btn-muted" onClick={() => removeProduct(product._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </article>
        </section>
      )}

      {activeTab === "coupons" && (
        <section className="grid">
          <article className="panel">
            <h3>Create Coupon</h3>
            <form className="stack" onSubmit={submitCoupon}>
              <input
                placeholder="Code"
                value={couponForm.code}
                onChange={(e) => setCouponForm((v) => ({ ...v, code: e.target.value }))}
                required
              />
              <div className="compact-row">
                <select
                  value={couponForm.discountType}
                  onChange={(e) =>
                    setCouponForm((v) => ({
                      ...v,
                      discountType: e.target.value as "percentage" | "fixed",
                    }))
                  }
                >
                  <option value="percentage">percentage</option>
                  <option value="fixed">fixed</option>
                </select>
                <input
                  placeholder="Discount value"
                  type="number"
                  value={couponForm.discountValue}
                  onChange={(e) =>
                    setCouponForm((v) => ({ ...v, discountValue: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="compact-row">
                <input
                  placeholder="Minimum purchase"
                  type="number"
                  value={couponForm.minPurchase}
                  onChange={(e) =>
                    setCouponForm((v) => ({ ...v, minPurchase: e.target.value }))
                  }
                />
                <input
                  type="datetime-local"
                  value={couponForm.expiryDate}
                  onChange={(e) =>
                    setCouponForm((v) => ({ ...v, expiryDate: e.target.value }))
                  }
                  required
                />
              </div>
              <label className="label" style={{ marginBottom: 0 }}>
                <input
                  type="checkbox"
                  checked={couponForm.isActive}
                  onChange={(e) =>
                    setCouponForm((v) => ({ ...v, isActive: e.target.checked }))
                  }
                  style={{ width: "auto", marginRight: 8 }}
                />
                Active
              </label>
              <button className="btn btn-accent" type="submit">Save Coupon</button>
            </form>
          </article>

          <article className="panel stack">
            {coupons.map((coupon) => (
              <div key={coupon._id} className="list-item">
                <strong>{coupon.code}</strong>{" "}
                <span className="pill">{coupon.discountType}</span>
                <div className="list-meta">
                  Value: {coupon.discountValue} • Expires:{" "}
                  {new Date(coupon.expiryDate).toLocaleString()}
                </div>
                <div className="list-actions">
                  <button className="btn btn-accent" onClick={() => editCoupon(coupon)}>
                    Edit
                  </button>
                  <button className="btn btn-muted" onClick={() => removeCoupon(coupon._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </article>
        </section>
      )}

      {activeTab === "orders" && (
        <section className="panel stack">
          {orders.map((order) => (
            <div key={order._id} className="list-item">
              <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
              <div className="list-meta">
                User: {typeof order.user === "string" ? order.user : order.user.email}
              </div>
              <div className="list-meta">
                Status: {order.orderStatus.toUpperCase()} • Total: ${order.totalPrice}
              </div>
              <div className="list-actions">
                <button className="btn btn-accent" onClick={() => updateOrderStatus(order._id)}>
                  Update Status
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {activeTab === "payments" && (
        <section className="panel stack">
          {payments.map((payment) => (
            <div key={payment._id} className="list-item">
              <strong>{payment.transactionId}</strong>{" "}
              <span className="pill">{payment.status.toUpperCase()}</span>
              <div className="list-meta">
                Amount: ${payment.amount} • Provider: {payment.paymentProvider}
              </div>
              <div className="list-meta">
                User: {typeof payment.user === "string" ? payment.user : payment.user.email}
              </div>
              <div className="list-actions">
                <button className="btn btn-accent" onClick={() => updatePaymentStatus(payment._id)}>
                  Update Status
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {activeTab === "notifications" && (
        <section className="grid">
          <article className="panel">
            <h3>Create Notification</h3>
            <form className="stack" onSubmit={submitNotification}>
              <input
                placeholder="User ID"
                value={notificationForm.user}
                onChange={(e) => setNotificationForm((v) => ({ ...v, user: e.target.value }))}
                required
              />
              <input
                placeholder="Title"
                value={notificationForm.title}
                onChange={(e) =>
                  setNotificationForm((v) => ({ ...v, title: e.target.value }))
                }
                required
              />
              <textarea
                placeholder="Message"
                value={notificationForm.message}
                onChange={(e) =>
                  setNotificationForm((v) => ({ ...v, message: e.target.value }))
                }
                required
              />
              <input
                placeholder="Type (optional)"
                value={notificationForm.type}
                onChange={(e) => setNotificationForm((v) => ({ ...v, type: e.target.value }))}
              />
              <button className="btn btn-accent" type="submit">Send Notification</button>
            </form>

            <h3 style={{ marginTop: 18 }}>Lookup By User</h3>
            <form
              className="stack"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!notificationLookupUserId.trim() || !token) return;
                try {
                  await loadNotificationsByUser(notificationLookupUserId.trim());
                  showStatus("Notifications loaded.");
                } catch (err) {
                  showError(err instanceof Error ? err.message : "Lookup failed");
                }
              }}
            >
              <input
                placeholder="User ID"
                value={notificationLookupUserId}
                onChange={(e) => setNotificationLookupUserId(e.target.value)}
              />
              <button className="btn btn-muted" type="submit">Load User Notifications</button>
            </form>
          </article>

          <article className="panel stack">
            {notifications.map((item) => (
              <div key={item._id} className="list-item">
                <strong>{item.title}</strong> {item.isRead ? <span className="pill">Read</span> : null}
                <div className="list-meta">{item.message}</div>
                <div className="list-meta">
                  {new Date(item.createdAt).toLocaleString()} • User: {item.user}
                </div>
              </div>
            ))}
          </article>
        </section>
      )}
    </main>
  );
}

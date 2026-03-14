import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { cartService, couponService, orderService, paymentService } from "@/src/lib/services";
import { CartItem, CouponValidation } from "@/src/types";
import { formatCurrency } from "@/src/lib/format";
import { RemoteImage } from "@/src/components/RemoteImage";
import { maybeProxyImageUri, resolveImageUri } from "@/src/lib/images";

const fallbackImage =
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80";

const TAX_RATE = 0.08;
const SHIPPING = 6;

export default function CartScreen() {
  const { token, user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<CouponValidation | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  const loadCart = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const cart = await cartService.mine(token);
      setItems(cart.items || []);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.priceAtTime, 0),
    [items]
  );
  const discountedSubtotal = coupon ? coupon.finalAmount : subtotal;
  const tax = useMemo(() => Number((discountedSubtotal * TAX_RATE).toFixed(2)), [discountedSubtotal]);
  const shipping = items.length ? SHIPPING : 0;
  const total = Number((discountedSubtotal + tax + shipping).toFixed(2));

  const changeQuantity = async (item: CartItem, nextQuantity: number) => {
    if (!token) return;
    const productId = typeof item.product === "string" ? item.product : item.product._id;
    try {
      if (nextQuantity <= 0) {
        await cartService.removeItem(token, productId, item.selectedVariant);
      } else {
        await cartService.upsertItem(token, {
          product: productId,
          quantity: nextQuantity,
          selectedVariant: item.selectedVariant,
        });
      }
      await loadCart();
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to update cart");
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const data = await couponService.validate(couponCode.trim().toUpperCase(), subtotal);
      setCoupon(data);
      Alert.alert("Coupon Applied", `Discount: ${formatCurrency(data.discount)}`);
    } catch (error) {
      setCoupon(null);
      Alert.alert("Invalid Coupon", error instanceof Error ? error.message : "Coupon not valid");
    }
  };

  const placeOrder = async () => {
    if (!token || !user || items.length === 0) return;
    setPlacingOrder(true);
    try {
      const order = await orderService.create(token, {
        items: items
          .map((item) => {
            if (typeof item.product === "string") return null;
            return {
              product: item.product._id,
              name: item.product.name,
              image: maybeProxyImageUri(resolveImageUri(item.product.images)) || fallbackImage,
              quantity: item.quantity,
              price: item.priceAtTime,
              selectedVariant: item.selectedVariant,
            };
          })
          .filter(Boolean) as {
            product: string;
            name: string;
            image: string;
            quantity: number;
            price: number;
            selectedVariant?: string;
          }[],
        shippingAddress: {
          fullName: user.name,
          phone: "0000000000",
          street: "Main Street",
          city: "Kathmandu",
          state: "Bagmati",
          postalCode: "44600",
          country: "Nepal",
        },
        paymentMethod: "cash_on_delivery",
        itemsPrice: discountedSubtotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: total,
      });

      await paymentService.create(token, {
        order: order._id,
        paymentProvider: "cash_on_delivery",
        transactionId: `txn_${Date.now()}`,
        amount: total,
        status: "pending",
      });

      await cartService.clear(token);
      setCoupon(null);
      setCouponCode("");
      await loadCart();
      Alert.alert("Order Created", "Your order was placed successfully.");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Cart</Text>

      {loading ? (
        <Text style={styles.placeholder}>Loading cart...</Text>
      ) : items.length === 0 ? (
        <Text style={styles.placeholder}>Your cart is empty.</Text>
      ) : (
        items.map((item, index) => {
          const product = item.product;
          if (typeof product === "string") return null;

          return (
            <View style={styles.itemCard} key={`${product._id}-${index}`}>
              <RemoteImage
                uri={maybeProxyImageUri(resolveImageUri(product.images))}
                fallbackUri={fallbackImage}
                style={styles.itemImage}
              />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.itemPrice}>{formatCurrency(item.priceAtTime)}</Text>

                <View style={styles.qtyRow}>
                  <Pressable
                    style={styles.qtyButton}
                    onPress={() => changeQuantity(item, item.quantity - 1)}
                  >
                    <Text style={styles.qtyButtonText}>-</Text>
                  </Pressable>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <Pressable
                    style={styles.qtyButton}
                    onPress={() => changeQuantity(item, item.quantity + 1)}
                  >
                    <Text style={styles.qtyButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Coupon</Text>
        <View style={styles.couponRow}>
          <TextInput
            value={couponCode}
            onChangeText={setCouponCode}
            style={styles.input}
            placeholder="Enter coupon code"
            autoCapitalize="characters"
          />
          <Pressable style={styles.applyButton} onPress={applyCoupon}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </Pressable>
        </View>
        {coupon && (
          <Text style={styles.successText}>
            {coupon.coupon.code} applied (-{formatCurrency(coupon.discount)})
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Row label="Items" value={formatCurrency(subtotal)} />
        <Row label="Tax" value={formatCurrency(tax)} />
        <Row label="Shipping" value={formatCurrency(shipping)} />
        <Row label="Total" value={formatCurrency(total)} strong />

        <Pressable
          style={[styles.checkoutButton, (items.length === 0 || placingOrder) && styles.disabled]}
          onPress={placeOrder}
          disabled={items.length === 0 || placingOrder}
        >
          <Text style={styles.checkoutButtonText}>
            {placingOrder ? "Processing..." : "Place Order"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, strong && styles.strong]}>{label}</Text>
      <Text style={[styles.summaryValue, strong && styles.strong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f5ee",
  },
  content: {
    padding: 14,
    paddingBottom: 34,
    gap: 12,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f1a14",
  },
  placeholder: {
    color: "#6e675f",
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e7e1d4",
    borderRadius: 16,
    padding: 10,
    gap: 10,
  },
  itemImage: {
    width: 78,
    height: 78,
    borderRadius: 10,
    backgroundColor: "#ececec",
  },
  itemContent: {
    flex: 1,
    gap: 6,
  },
  itemTitle: {
    fontWeight: "700",
    color: "#1f1a14",
  },
  itemPrice: {
    color: "#d4751f",
    fontWeight: "800",
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtyButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d8cfbc",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f6f0",
  },
  qtyButtonText: {
    fontWeight: "700",
    fontSize: 18,
    color: "#4f4335",
  },
  qtyText: {
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e7e1d4",
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1f1a14",
  },
  couponRow: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5dfd0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#fcfaf5",
  },
  applyButton: {
    backgroundColor: "#1f1a14",
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  successText: {
    color: "#1e8c43",
    fontWeight: "600",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    color: "#5e5851",
  },
  summaryValue: {
    color: "#1f1a14",
  },
  strong: {
    fontWeight: "800",
  },
  checkoutButton: {
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: "#d4751f",
    alignItems: "center",
    paddingVertical: 12,
  },
  checkoutButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
  disabled: {
    opacity: 0.6,
  },
});

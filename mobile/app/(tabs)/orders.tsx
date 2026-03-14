import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { orderService } from "@/src/lib/services";
import { formatCurrency, formatDate } from "@/src/lib/format";
import { Order } from "@/src/types";

export default function OrdersScreen() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await orderService.mine(token);
      setOrders(data);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Orders</Text>
      {loading ? (
        <Text style={styles.placeholder}>Loading orders...</Text>
      ) : orders.length === 0 ? (
        <Text style={styles.placeholder}>No orders yet.</Text>
      ) : (
        orders.map((order) => (
          <View style={styles.card} key={order._id}>
            <View style={styles.row}>
              <Text style={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</Text>
              <Text style={styles.total}>{formatCurrency(order.totalPrice)}</Text>
            </View>
            <Text style={styles.meta}>Status: {order.orderStatus.toUpperCase()}</Text>
            <Text style={styles.meta}>Items: {order.items.length}</Text>
            <Text style={styles.meta}>Date: {formatDate(order.createdAt)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f5ee",
  },
  content: {
    padding: 14,
    gap: 12,
    paddingBottom: 34,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f1a14",
  },
  placeholder: {
    color: "#6e675f",
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e7e1d4",
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderId: {
    fontWeight: "800",
    color: "#1f1a14",
  },
  total: {
    color: "#d4751f",
    fontWeight: "800",
  },
  meta: {
    color: "#635d56",
  },
});

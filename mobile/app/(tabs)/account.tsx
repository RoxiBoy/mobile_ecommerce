import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { paymentService } from "@/src/lib/services";
import { formatCurrency, formatDate } from "@/src/lib/format";
import { Payment } from "@/src/types";

export default function AccountScreen() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);

  const initials = useMemo(() => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [user?.name]);

  const loadPayments = useCallback(async () => {
    if (!token) return;
    try {
      const data = await paymentService.mine(token);
      setPayments(data);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to load payments");
    }
  }, [token]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user?.name || "Customer"}</Text>
          <Text style={styles.email}>{user?.email || ""}</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <Pressable style={styles.secondaryButton} onPress={() => router.push("/notifications")}>
          <Text style={styles.secondaryButtonText}>Notifications</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => {
            logout();
            router.replace("/auth");
          }}
        >
          <Text style={styles.secondaryButtonText}>Logout</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>My Payments</Text>
      {payments.length === 0 ? (
        <Text style={styles.placeholder}>No payments yet.</Text>
      ) : (
        payments.map((payment) => (
          <View style={styles.paymentCard} key={payment._id}>
            <Text style={styles.paymentTop}>
              {payment.paymentProvider.replaceAll("_", " ").toUpperCase()} •{" "}
              {payment.status.toUpperCase()}
            </Text>
            <Text style={styles.paymentMeta}>Amount: {formatCurrency(payment.amount)}</Text>
            <Text style={styles.paymentMeta}>Txn: {payment.transactionId}</Text>
            <Text style={styles.paymentMeta}>Date: {formatDate(payment.createdAt)}</Text>
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
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e7e1d4",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#1f1a14",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 20,
  },
  profileInfo: {
    gap: 2,
  },
  name: {
    fontSize: 18,
    color: "#1f1a14",
    fontWeight: "800",
  },
  email: {
    color: "#686159",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d9cfbe",
    backgroundColor: "#fff",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: "#473b2f",
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#1f1a14",
  },
  placeholder: {
    color: "#6e675f",
  },
  paymentCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e7e1d4",
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  paymentTop: {
    color: "#1f1a14",
    fontWeight: "800",
  },
  paymentMeta: {
    color: "#635d56",
  },
});

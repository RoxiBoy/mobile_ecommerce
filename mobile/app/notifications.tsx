import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { notificationService } from "@/src/lib/services";
import { formatDate } from "@/src/lib/format";
import { NotificationItem } from "@/src/types";

export default function NotificationsScreen() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await notificationService.mine(token);
      setNotifications(data);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const markAll = async () => {
    if (!token) return;
    try {
      await notificationService.markAllRead(token);
      await load();
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to update");
    }
  };

  const markSingle = async (notificationId: string) => {
    if (!token) return;
    try {
      await notificationService.markRead(token, notificationId);
      await load();
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to update");
    }
  };

  const removeSingle = async (notificationId: string) => {
    if (!token) return;
    try {
      await notificationService.remove(token, notificationId);
      await load();
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to delete");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.markAllButton} onPress={markAll}>
        <Text style={styles.markAllText}>Mark all as read</Text>
      </Pressable>

      {loading ? (
        <Text style={styles.placeholder}>Loading notifications...</Text>
      ) : notifications.length === 0 ? (
        <Text style={styles.placeholder}>No notifications yet.</Text>
      ) : (
        notifications.map((item) => (
          <View key={item._id} style={[styles.card, item.isRead ? undefined : styles.unread]}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.meta}>{formatDate(item.createdAt)}</Text>
            <View style={styles.row}>
              {!item.isRead && (
                <Pressable style={[styles.smallButton, styles.readButton]} onPress={() => markSingle(item._id)}>
                  <Text style={styles.smallButtonText}>Mark Read</Text>
                </Pressable>
              )}
              <Pressable style={[styles.smallButton, styles.deleteButton]} onPress={() => removeSingle(item._id)}>
                <Text style={styles.smallButtonText}>Delete</Text>
              </Pressable>
            </View>
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
    paddingBottom: 30,
  },
  markAllButton: {
    alignSelf: "flex-start",
    backgroundColor: "#1f1a14",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  markAllText: {
    color: "#fff",
    fontWeight: "700",
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
    gap: 6,
  },
  unread: {
    backgroundColor: "#fff6ee",
    borderColor: "#efc79c",
  },
  title: {
    color: "#1f1a14",
    fontWeight: "800",
    fontSize: 16,
  },
  message: {
    color: "#5f5a53",
  },
  meta: {
    color: "#7c756d",
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  smallButton: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  readButton: {
    backgroundColor: "#d4751f",
  },
  deleteButton: {
    backgroundColor: "#42382e",
  },
  smallButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});

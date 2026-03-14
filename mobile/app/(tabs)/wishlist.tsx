import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { cartService, wishlistService } from "@/src/lib/services";
import { Product } from "@/src/types";
import { formatCurrency } from "@/src/lib/format";
import { RemoteImage } from "@/src/components/RemoteImage";
import { maybeProxyImageUri, resolveImageUri } from "@/src/lib/images";

const fallbackImage =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80";

export default function WishlistScreen() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const wishlist = await wishlistService.mine(token);
      setProducts(wishlist.products || []);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const moveToCart = async (productId: string) => {
    if (!token) return;
    try {
      await cartService.upsertItem(token, { product: productId, quantity: 1 });
      Alert.alert("Added", "Item added to cart.");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to add to cart");
    }
  };

  const removeItem = async (productId: string) => {
    if (!token) return;
    try {
      await wishlistService.toggle(token, productId);
      await loadWishlist();
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to update wishlist");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Wishlist</Text>
      {loading ? (
        <Text style={styles.placeholder}>Loading wishlist...</Text>
      ) : products.length === 0 ? (
        <Text style={styles.placeholder}>No saved products yet.</Text>
      ) : (
        products.map((product) => (
          <View style={styles.card} key={product._id}>
            <RemoteImage
              uri={maybeProxyImageUri(resolveImageUri(product.images))}
              fallbackUri={fallbackImage}
              style={styles.image}
            />
            <View style={styles.body}>
              <Text style={styles.title} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={styles.price}>{formatCurrency(product.discountPrice ?? product.price)}</Text>
              <View style={styles.actions}>
                <Pressable style={[styles.button, styles.primary]} onPress={() => moveToCart(product._id)}>
                  <Text style={styles.primaryText}>Add to Cart</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.secondary]} onPress={() => removeItem(product._id)}>
                  <Text style={styles.secondaryText}>Remove</Text>
                </Pressable>
              </View>
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
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderColor: "#e7e1d4",
    borderWidth: 1,
    padding: 10,
    gap: 10,
  },
  image: {
    width: 84,
    height: 84,
    borderRadius: 10,
    backgroundColor: "#ececec",
  },
  body: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontWeight: "700",
    color: "#1f1a14",
  },
  price: {
    fontWeight: "800",
    color: "#d4751f",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 10,
  },
  primary: {
    backgroundColor: "#1f1a14",
  },
  secondary: {
    backgroundColor: "#f8f4eb",
    borderWidth: 1,
    borderColor: "#d8cfbc",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
  },
  secondaryText: {
    color: "#4f4335",
    fontWeight: "700",
  },
});

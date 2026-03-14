import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { cartService, catalogService, wishlistService } from "@/src/lib/services";
import { formatCurrency } from "@/src/lib/format";
import { Product } from "@/src/types";
import { RemoteImage } from "@/src/components/RemoteImage";
import { maybeProxyImageUri, resolveImageUri } from "@/src/lib/images";

const fallbackImage =
  "https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=900&q=80";

export default function ProductDetailsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const productId = String(params.id || "");
  const { token } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");

  const loadProduct = useCallback(async () => {
    setLoading(true);
    try {
      const data = await catalogService.productById(productId);
      setProduct(data);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [loadProduct, productId]);

  const currentPrice = useMemo(
    () => (product ? product.discountPrice ?? product.price : 0),
    [product]
  );

  const onAddToCart = async () => {
    if (!token || !product) return;
    try {
      await cartService.upsertItem(token, { product: product._id, quantity });
      Alert.alert("Added", "Item added to cart.");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to add item");
    }
  };

  const onToggleWishlist = async () => {
    if (!token || !product) return;
    try {
      await wishlistService.toggle(token, product._id);
      Alert.alert("Updated", "Wishlist updated.");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to update wishlist");
    }
  };

  const onSubmitReview = async () => {
    if (!token || !product) return;
    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      Alert.alert("Validation", "Rating must be between 1 and 5.");
      return;
    }
    try {
      await catalogService.addReview(product._id, token, numericRating, comment.trim() || undefined);
      setComment("");
      Alert.alert("Success", "Review submitted.");
      await loadProduct();
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to submit review");
    }
  };

  if (loading || !product) {
    return (
      <View style={styles.center}>
        <Text style={styles.subtle}>Loading product...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <RemoteImage
        uri={maybeProxyImageUri(resolveImageUri(product.images))}
        fallbackUri={fallbackImage}
        style={styles.image}
      />

      <View style={styles.card}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.description}>{product.description}</Text>
        <Text style={styles.price}>{formatCurrency(currentPrice)}</Text>
        <Text style={styles.subtle}>
          Stock: {product.stock} • {product.rating?.toFixed(1) || "0.0"} stars • {product.numReviews || 0} reviews
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Purchase</Text>
        <View style={styles.qtyRow}>
          <Pressable style={styles.qtyButton} onPress={() => setQuantity((q) => Math.max(1, q - 1))}>
            <Text style={styles.qtyButtonText}>-</Text>
          </Pressable>
          <Text style={styles.qtyText}>{quantity}</Text>
          <Pressable style={styles.qtyButton} onPress={() => setQuantity((q) => q + 1)}>
            <Text style={styles.qtyButtonText}>+</Text>
          </Pressable>
        </View>

        <View style={styles.actionRow}>
          <Pressable style={[styles.actionBtn, styles.primary]} onPress={onAddToCart}>
            <Text style={styles.primaryText}>Add to Cart</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, styles.secondary]} onPress={onToggleWishlist}>
            <Text style={styles.secondaryText}>Wishlist</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Add Review</Text>
        <TextInput
          value={rating}
          onChangeText={setRating}
          placeholder="Rating (1-5)"
          keyboardType="number-pad"
          style={styles.input}
        />
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Write your comment"
          style={[styles.input, styles.commentInput]}
          multiline
        />
        <Pressable style={[styles.actionBtn, styles.primary]} onPress={onSubmitReview}>
          <Text style={styles.primaryText}>Submit Review</Text>
        </Pressable>
      </View>
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
    paddingBottom: 34,
    gap: 12,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f5ee",
  },
  image: {
    width: "100%",
    height: 260,
    borderRadius: 20,
    backgroundColor: "#ececec",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e7e1d4",
    padding: 14,
    gap: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f1a14",
  },
  description: {
    color: "#5f5a53",
  },
  price: {
    color: "#d4751f",
    fontWeight: "800",
    fontSize: 20,
  },
  subtle: {
    color: "#7a746e",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1f1a14",
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  qtyButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d8cfbc",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f6f0",
  },
  qtyButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4f4335",
  },
  qtyText: {
    minWidth: 24,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primary: {
    backgroundColor: "#1f1a14",
    flex: 1,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "800",
  },
  secondary: {
    borderWidth: 1,
    borderColor: "#d8cfbc",
    backgroundColor: "#f8f4eb",
    flex: 1,
  },
  secondaryText: {
    color: "#53493d",
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5dfd0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fcfaf5",
  },
  commentInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
});

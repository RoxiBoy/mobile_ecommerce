import { Pressable, StyleSheet, Text, View } from "react-native";
import { Product } from "@/src/types";
import { formatCurrency } from "@/src/lib/format";
import { RemoteImage } from "@/src/components/RemoteImage";
import { maybeProxyImageUri, resolveImageUri } from "@/src/lib/images";

const fallbackImage =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80";

interface ProductCardProps {
  product: Product;
  onOpen: (id: string) => void;
  onAddToCart: (id: string) => void;
  onToggleWishlist: (id: string) => void;
}

export function ProductCard({
  product,
  onOpen,
  onAddToCart,
  onToggleWishlist,
}: ProductCardProps) {
  const currentPrice = product.discountPrice ?? product.price;

  return (
    <View style={styles.card}>
      <Pressable onPress={() => onOpen(product._id)}>
        <RemoteImage
          uri={maybeProxyImageUri(resolveImageUri(product.images))}
          fallbackUri={fallbackImage}
          style={styles.image}
        />
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {product.description}
        </Text>
        <Text style={styles.price}>{formatCurrency(currentPrice)}</Text>
        <Text style={styles.meta}>
          {product.rating?.toFixed(1) || "0.0"} stars • {product.numReviews || 0} reviews
        </Text>

        <View style={styles.actions}>
          <Pressable style={[styles.button, styles.primary]} onPress={() => onAddToCart(product._id)}>
            <Text style={[styles.buttonText, styles.primaryText]}>Add to Cart</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.ghost]} onPress={() => onToggleWishlist(product._id)}>
            <Text style={[styles.buttonText, styles.ghostText]}>Wishlist</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#ebe8dc",
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 14,
  },
  image: {
    width: "100%",
    height: 170,
    backgroundColor: "#ececec",
  },
  content: {
    padding: 12,
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f1a14",
  },
  description: {
    color: "#646464",
  },
  price: {
    color: "#d4751f",
    fontSize: 17,
    fontWeight: "800",
  },
  meta: {
    color: "#787878",
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  primary: {
    backgroundColor: "#1f1a14",
  },
  ghost: {
    borderWidth: 1,
    borderColor: "#d9d3c1",
    backgroundColor: "#f8f6f0",
  },
  buttonText: {
    fontWeight: "700",
  },
  primaryText: {
    color: "#fff",
  },
  ghostText: {
    color: "#4f4335",
  },
});

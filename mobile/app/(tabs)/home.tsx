import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { ProductCard } from "@/src/components/ProductCard";
import { useAuth } from "@/src/context/AuthContext";
import { cartService, catalogService, wishlistService } from "@/src/lib/services";
import { Category, Product } from "@/src/types";

export default function HomeScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);

  const load = useCallback(
    async (searchQuery?: string) => {
      setLoading(true);
      try {
        const [categoryData, featuredData, productResponse] = await Promise.all([
          catalogService.categories(),
          catalogService.featured(),
          catalogService.products({
            search: searchQuery?.trim() || undefined,
            page: 1,
            limit: 25,
          }),
        ]);
        setCategories(categoryData);
        setFeatured(featuredData);
        setProducts(productResponse.data);
      } catch (error) {
        Alert.alert(
          "Error",
          error instanceof Error ? error.message : "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(search);
    setRefreshing(false);
  };

  const onSearch = async () => {
    await load(search);
  };

  const onAddToCart = async (productId: string) => {
    if (!token) return;
    try {
      await cartService.upsertItem(token, { product: productId, quantity: 1 });
      Alert.alert("Added", "Item added to cart.");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to add item");
    }
  };

  const onToggleWishlist = async (productId: string) => {
    if (!token) return;
    try {
      await wishlistService.toggle(token, productId);
      Alert.alert("Updated", "Wishlist updated.");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update wishlist"
      );
    }
  };

  const promoted = useMemo(() => (featured.length ? featured : products.slice(0, 4)), [featured, products]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.hero}>
        <Text style={styles.heroTag}>LIVE BACKEND</Text>
        <Text style={styles.heroTitle}>Discover products that move fast.</Text>
        <Text style={styles.heroText}>
          Search catalog, add to cart, and order in one flow using your Node/Express APIs.
        </Text>
        <Pressable style={styles.heroButton} onPress={() => router.push("/notifications")}>
          <Text style={styles.heroButtonText}>View Notifications</Text>
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search products"
          style={styles.searchInput}
        />
        <Pressable style={styles.searchButton} onPress={onSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.chipsWrap}>
        {categories.map((category) => (
          <View key={category._id} style={styles.chip}>
            <Text style={styles.chipText}>{category.name}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Featured</Text>
      {promoted.map((product) => (
        <ProductCard
          key={`featured-${product._id}`}
          product={product}
          onOpen={(id) => router.push(`/product/${id}`)}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
        />
      ))}

      <Text style={styles.sectionTitle}>All Products</Text>
      {loading ? (
        <Text style={styles.placeholder}>Loading products...</Text>
      ) : products.length === 0 ? (
        <Text style={styles.placeholder}>No products found.</Text>
      ) : (
        products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onOpen={(id) => router.push(`/product/${id}`)}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
          />
        ))
      )}

      <Pressable style={styles.chatFab} onPress={() => router.push("/(tabs)/chat")}>
        <Text style={styles.chatFabText}>Chat</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f5ee",
  },
  contentContainer: {
    padding: 14,
    paddingBottom: 34,
  },
  hero: {
    backgroundColor: "#1f1a14",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  heroTag: {
    color: "#d8b28a",
    fontWeight: "800",
    letterSpacing: 1,
    fontSize: 12,
  },
  heroTitle: {
    marginTop: 6,
    color: "#fff",
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "800",
  },
  heroText: {
    marginTop: 8,
    color: "#f5dfcc",
    fontSize: 14,
  },
  heroButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "#d4751f",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5dfd0",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchButton: {
    backgroundColor: "#d4751f",
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#1f1a14",
    marginBottom: 10,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    backgroundColor: "#efe8d7",
    borderColor: "#deccb0",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipText: {
    color: "#80582e",
    fontWeight: "700",
  },
  placeholder: {
    color: "#6e675f",
    marginBottom: 8,
  },
  chatFab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    backgroundColor: "#1f1a14",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  chatFabText: {
    color: "#fff",
    fontWeight: "800",
  },
});

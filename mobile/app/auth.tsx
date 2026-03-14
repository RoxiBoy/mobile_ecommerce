import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";

type Mode = "login" | "register";

export default function AuthScreen() {
  const router = useRouter();
  const { login, register, loading } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isRegister = mode === "register";

  const onSubmit = async () => {
    try {
      if (isRegister) {
        if (!name.trim()) {
          Alert.alert("Validation", "Name is required.");
          return;
        }
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      router.replace("/(tabs)/home");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      Alert.alert("Authentication Failed", message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.hero}>
        <Text style={styles.badge}>MOBILE ECOMMERCE</Text>
        <Text style={styles.title}>Shop faster. Track everything.</Text>
        <Text style={styles.subtitle}>
          Login to browse products, manage cart and wishlist, place orders, and see notifications.
        </Text>
      </View>

      <View style={styles.card}>
        {isRegister && (
          <TextInput
            placeholder="Full name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            autoCapitalize="words"
          />
        )}

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        <Pressable style={styles.primaryBtn} onPress={onSubmit} disabled={loading}>
          <Text style={styles.primaryBtnText}>{loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}</Text>
        </Pressable>

        <View style={styles.row}>
          <Text style={styles.switchText}>
            {isRegister ? "Already have an account?" : "New here?"}
          </Text>
          <Pressable onPress={() => setMode(isRegister ? "login" : "register")}>
            <Text style={styles.switchLink}>{isRegister ? "Sign in" : "Create one"}</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: "#f7f5ee",
    justifyContent: "center",
    gap: 20,
  },
  hero: {
    gap: 8,
  },
  badge: {
    color: "#996a34",
    fontWeight: "800",
    letterSpacing: 1,
    fontSize: 12,
  },
  title: {
    color: "#1f1a14",
    fontWeight: "800",
    fontSize: 30,
    lineHeight: 34,
  },
  subtitle: {
    color: "#5d564f",
    fontSize: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e7e1d4",
    padding: 14,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5dfd0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fcfaf5",
  },
  primaryBtn: {
    marginTop: 4,
    backgroundColor: "#1f1a14",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  switchText: {
    color: "#5d564f",
  },
  switchLink: {
    color: "#d4751f",
    fontWeight: "800",
  },
});

import { Stack } from "expo-router";
import { AuthProvider } from "@/src/context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#ffffff" },
          headerTintColor: "#1f1a14",
          contentStyle: { backgroundColor: "#f7f5ee" },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ title: "Product Details" }} />
        <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
      </Stack>
    </AuthProvider>
  );
}

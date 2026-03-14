import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/src/context/AuthContext";

export default function Index() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f7f5ee",
        }}
      >
        <ActivityIndicator size="large" color="#1f1a14" />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/auth" />;
  }

  return (
    <Redirect href="/(tabs)/home" />
  );
}

import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../hooks/useAuth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0B0F17" },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Protected guard={!loading && user !== null}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="task" />
          <Stack.Screen name="note" />
          <Stack.Screen name="profile" />
        </Stack.Protected>
        <Stack.Protected guard={!loading && user === null}>
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/register" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

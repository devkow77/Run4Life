import { auth } from "@/firebaseConfig";
import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { StatusBar } from "react-native";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/(auth)/login");
      } else {
        router.replace("/(tabs)");
      }
    });
  }, []);

  return (
    <>
      <StatusBar hidden />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="run/[id]" />
      </Stack>
    </>
  );
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GameStateProvider } from "@/providers/GameStateProvider";
import { configureRevenueCat } from "@/utils/purchases";

void SplashScreen.preventAutoHideAsync();
configureRevenueCat();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GameStateProvider>
        <RootLayoutNav />
      </GameStateProvider>
    </QueryClientProvider>
  );
}

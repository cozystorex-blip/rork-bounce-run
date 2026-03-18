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
      <Stack.Screen
        name="game"
        options={{
          animation: 'fade',
          gestureEnabled: false,
          fullScreenGestureEnabled: false,
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen name="support" options={{ headerShown: true, headerTitle: 'Support', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="+not-found" />
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

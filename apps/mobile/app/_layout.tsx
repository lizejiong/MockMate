import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppThemeProvider } from "@/theme/AppThemeProvider";

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </AppThemeProvider>
  );
}

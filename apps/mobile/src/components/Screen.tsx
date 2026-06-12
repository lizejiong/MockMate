import { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/theme/useTheme";

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  contentStyle?: ViewStyle;
}>;

export function Screen({ children, scroll = true, contentStyle }: ScreenProps) {
  const theme = useTheme();

  if (!scroll) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        {children}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { padding: theme.spacing.lg, gap: theme.spacing.md },
          contentStyle
        ]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  content: {
    flexGrow: 1
  }
});

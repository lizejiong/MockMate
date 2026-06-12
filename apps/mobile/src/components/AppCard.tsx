import { PropsWithChildren } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { ColorTokens } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";

type CardTone = "default" | "info" | "success" | "warning" | "danger";

type AppCardProps = PropsWithChildren<{
  tone?: CardTone;
  style?: ViewStyle;
}>;

const toneColor = (colors: ColorTokens, tone: CardTone) => {
  const map: Record<CardTone, string> = {
    default: colors.border,
    info: colors.info,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger
  };

  return map[tone];
};

export function AppCard({ children, tone = "default", style }: AppCardProps) {
  const theme = useTheme();
  const color = toneColor(theme.colors, tone);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderLeftColor: color,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 4
  }
});

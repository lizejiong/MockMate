import { PropsWithChildren } from "react";
import { Pressable, PressableProps, StyleSheet, Text } from "react-native";

import { useTheme } from "@/theme/useTheme";

type ButtonVariant = "primary" | "secondary";

type AppButtonProps = PropsWithChildren<
  PressableProps & {
    variant?: ButtonVariant;
  }
>;

export function AppButton({ children, variant = "primary", style, ...props }: AppButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === "primary";

  return (
    <Pressable
      {...props}
      style={(state) => [
        styles.button,
        {
          backgroundColor: isPrimary ? theme.colors.accent : theme.colors.surfaceElevated,
          borderColor: isPrimary ? theme.colors.accent : theme.colors.border,
          opacity: state.pressed ? 0.82 : 1,
          borderRadius: theme.radius.sm,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md
        },
        typeof style === "function" ? style(state) : style
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: isPrimary ? "#FFFFFF" : theme.colors.textPrimary,
            fontSize: theme.typography.body
          }
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
    justifyContent: "center"
  },
  label: {
    fontWeight: "700"
  }
});

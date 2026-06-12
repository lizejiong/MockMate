import { StyleSheet, Text } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { Screen } from "@/components/Screen";
import { useTheme } from "@/theme/useTheme";

export default function SettingsScreen() {
  const theme = useTheme();

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>我的</Text>

      <AppCard tone="info">
        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>模型配置</Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          MVP 使用 BYOK。API Key 只能通过 expo-secure-store 保存，不写入日志、AsyncStorage 或普通文件。
        </Text>
      </AppCard>

      <AppButton>添加模型 API Key</AppButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "800"
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8
  },
  body: {
    fontSize: 16,
    lineHeight: 24
  }
});

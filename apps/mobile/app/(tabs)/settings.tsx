import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { Screen } from "@/components/Screen";
import { getProviderLabel } from "@/features/model-config/modelConfig";
import { useModelConfigStore } from "@/features/model-config/useModelConfigStore";
import { useTheme } from "@/theme/useTheme";

export default function SettingsScreen() {
  const theme = useTheme();
  const { preferences, load } = useModelConfigStore();

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>我的</Text>

      <AppCard tone={preferences ? "success" : "info"}>
        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>模型配置</Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          {preferences
            ? `${getProviderLabel(preferences.provider)} · ${preferences.model}`
            : "MVP 使用 BYOK。API Key 只能通过 expo-secure-store 保存，不写入日志、AsyncStorage 或普通文件。"}
        </Text>
      </AppCard>

      <AppButton
        onPress={() =>
          router.push({
            pathname: "/model-config",
            params: { reason: "settings" }
          })
        }
      >
        {preferences ? "管理模型配置" : "添加模型 API Key"}
      </AppButton>
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

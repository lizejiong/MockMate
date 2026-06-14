import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { Screen } from "@/components/Screen";
import { getProviderLabel } from "@/features/model-config/modelConfig";
import { useModelConfigStore } from "@/features/model-config/useModelConfigStore";
import { useTheme } from "@/theme/useTheme";

export default function HomeScreen() {
  const theme = useTheme();
  const { preferences, load, hasActiveConfig } = useModelConfigStore();

  useEffect(() => {
    void load();
  }, [load]);

  const requireModelConfig = async (reason: "interview" | "resume") => {
    const isConfigured = await hasActiveConfig();

    if (!isConfigured) {
      router.push({
        pathname: "/model-config",
        params: { reason }
      });
      return;
    }

    router.push(reason === "resume" ? "/resume-diagnosis" : "/interview");
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={[styles.kicker, { color: theme.colors.accent }]}>AI 面试教练</Text>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>把每一次练习变成下一轮面试的证据。</Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          从简历诊断到追问点评，再到报告和学习模式，围绕真实候选人背景推进。
        </Text>
      </View>

      <View style={styles.actions}>
        <AppButton onPress={() => void requireModelConfig("interview")}>开始面试</AppButton>
        <AppButton variant="secondary" onPress={() => void requireModelConfig("resume")}>
          简历诊断
        </AppButton>
      </View>

      <AppCard tone={preferences ? "success" : "info"}>
        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>模型配置</Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          {preferences
            ? `${getProviderLabel(preferences.provider)} · ${preferences.model}`
            : "开始 AI 功能前需要先配置 BYOK 模型。"}
        </Text>
      </AppCard>

      <AppCard tone="warning">
        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>持续弱点</Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>项目结果表达不足。完成一场面试后会在这里展示趋势和专项入口。</Text>
      </AppCard>

      <AppCard tone="info">
        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>最近报告</Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>暂无报告。完成模拟面试后会展示总分、证据锚点和下一步练习建议。</Text>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 10,
    paddingTop: 12
  },
  kicker: {
    fontSize: 14,
    fontWeight: "800"
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 38
  },
  body: {
    fontSize: 16,
    lineHeight: 24
  },
  actions: {
    gap: 10
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8
  }
});

import { StyleSheet, Text } from "react-native";

import { AppCard } from "@/components/AppCard";
import { Screen } from "@/components/Screen";
import { useTheme } from "@/theme/useTheme";

export default function HistoryScreen() {
  const theme = useTheme();

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>历史记录</Text>
      <AppCard>
        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>暂无面试记录</Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          后续会展示报告、弱点、学习状态和同方向复盘对比。历史页允许在没有 API Key 时查看本地记录。
        </Text>
      </AppCard>
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

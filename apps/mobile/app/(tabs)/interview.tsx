import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { Screen } from "@/components/Screen";
import { useTheme } from "@/theme/useTheme";

const workbenchItems = [
  {
    title: "简历面试",
    description: "围绕简历项目经历深挖，重点检查职责、技术取舍和结果产出。"
  },
  {
    title: "JD 面试",
    description: "粘贴岗位 JD 后，按岗位关键词生成面试规划。"
  },
  {
    title: "React Native 专项",
    description: "覆盖性能、架构、调试、跨端能力和上线问题。"
  },
  {
    title: "恢复进行中面试",
    description: "后续会从本地历史记录恢复未完成的面试流程。"
  }
];

export default function InterviewScreen() {
  const theme = useTheme();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>训练工作台</Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>先完成模型配置，再进入真实 AI 面试流程。</Text>
      </View>

      {workbenchItems.map((item, index) => (
        <AppCard key={item.title} tone={index === 0 ? "info" : "default"}>
          <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>{item.description}</Text>
        </AppCard>
      ))}

      <AppButton>配置面试参数</AppButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8
  },
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

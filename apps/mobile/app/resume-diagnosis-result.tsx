import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { Screen } from "@/components/Screen";
import {
  getResumeDiagnosisRecord,
  StoredResumeDiagnosisRecord
} from "@/features/resume-diagnosis/resumeDiagnosisStorage";
import { useTheme } from "@/theme/useTheme";

const severityLabel: Record<string, string> = {
  low: "低风险",
  medium: "中风险",
  high: "高风险"
};

export default function ResumeDiagnosisResultScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [record, setRecord] = useState<StoredResumeDiagnosisRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadRecord() {
      if (!id) {
        setRecord(null);
        setIsLoading(false);
        return;
      }

      const nextRecord = await getResumeDiagnosisRecord(id);

      if (isMounted) {
        setRecord(nextRecord);
        setIsLoading(false);
      }
    }

    void loadRecord();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <Screen>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>读取诊断结果...</Text>
      </Screen>
    );
  }

  if (!record) {
    return (
      <Screen>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>未找到诊断结果</Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          这条记录可能已经被清理，或当前链接缺少有效的诊断 ID。
        </Text>
        <AppButton onPress={() => router.replace("/resume-diagnosis")}>重新诊断</AppButton>
      </Screen>
    );
  }

  const result = record.result;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.colors.accent }]}>诊断结果</Text>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>简历里最值得优化的证据点</Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          {record.input.targetRole ? `目标岗位：${record.input.targetRole}` : "未指定目标岗位"}
        </Text>
      </View>

      {result.isStructured ? (
        <>
          <AppCard tone="success">
            <Text style={[styles.score, { color: theme.colors.textPrimary }]}>
              综合评分：{result.data.overallScore}/100
            </Text>
            <Text style={[styles.body, { color: theme.colors.textSecondary }]}>{result.data.summary}</Text>
          </AppCard>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>主要问题</Text>
            {result.data.issues.map((issue, index) => (
              <AppCard
                key={`${issue.section}-${issue.originalText}-${index}`}
                tone={issue.severity === "high" ? "danger" : issue.severity === "medium" ? "warning" : "default"}
              >
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                  {issue.section} · {severityLabel[issue.severity]}
                </Text>
                <Text style={[styles.label, { color: theme.colors.textPrimary }]}>原文</Text>
                <Text style={[styles.body, { color: theme.colors.textSecondary }]}>{issue.originalText}</Text>
                <Text style={[styles.label, { color: theme.colors.textPrimary }]}>问题</Text>
                <Text style={[styles.body, { color: theme.colors.textSecondary }]}>{issue.problem}</Text>
                <Text style={[styles.label, { color: theme.colors.textPrimary }]}>建议</Text>
                <Text style={[styles.body, { color: theme.colors.textSecondary }]}>{issue.suggestion}</Text>
                <Text style={[styles.label, { color: theme.colors.textPrimary }]}>优化示例</Text>
                <Text style={[styles.body, { color: theme.colors.textSecondary }]}>{issue.improvedExample}</Text>
              </AppCard>
            ))}
          </View>

          <AppCard tone="info">
            <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>缺失信号</Text>
            <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
              {result.data.missingSignals.join("、") || "暂无明显缺失信号"}
            </Text>
          </AppCard>

          <AppCard tone="info">
            <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>推荐面试关注点</Text>
            <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
              {result.data.recommendedInterviewFocus.join("、") || "暂无推荐关注点"}
            </Text>
          </AppCard>
        </>
      ) : (
        <AppCard tone="warning">
          <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>模型返回了非结构化结果</Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>{result.errorMessage}</Text>
          <Text style={[styles.rawText, { color: theme.colors.textPrimary }]}>{result.rawText}</Text>
        </AppCard>
      )}

      <View style={styles.actions}>
        <AppButton onPress={() => router.push("/resume-diagnosis")}>再次诊断</AppButton>
        <AppButton variant="secondary" onPress={() => router.back()}>
          返回
        </AppButton>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8
  },
  section: {
    gap: 12
  },
  kicker: {
    fontSize: 14,
    fontWeight: "800"
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 36
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800"
  },
  score: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 8
  },
  body: {
    fontSize: 16,
    lineHeight: 24
  },
  rawText: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12
  },
  actions: {
    gap: 10
  }
});

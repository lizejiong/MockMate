import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { Screen } from "@/components/Screen";
import { runResumeDiagnosis } from "@/features/resume-diagnosis/runResumeDiagnosis";
import { useTheme } from "@/theme/useTheme";

const minimumResumeLength = 50;

export default function ResumeDiagnosisScreen() {
  const theme = useTheme();
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const normalizedResumeText = resumeText.trim();

    if (normalizedResumeText.length < minimumResumeLength) {
      setMessage("请粘贴至少 50 个字符的简历内容，方便模型给出有效诊断。");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const record = await runResumeDiagnosis({
        resumeText: normalizedResumeText,
        targetRole,
        jobDescription
      });

      router.push({
        pathname: "/resume-diagnosis-result",
        params: { id: record.id }
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "简历诊断失败，请稍后重试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.colors.accent }]}>简历诊断</Text>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>先找到简历里最容易被追问的地方</Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          粘贴简历文本后，AI 会从项目表达、个人职责、量化结果、技术难点和岗位匹配几个维度给出诊断。
        </Text>
      </View>

      <AppCard tone="info">
        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>输入建议</Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          优先粘贴项目经历、技术栈、实习或工作经历。目标岗位和 JD 可选，但填写后诊断会更贴近实际面试。
        </Text>
      </AppCard>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>目标岗位</Text>
        <TextInput
          value={targetRole}
          onChangeText={setTargetRole}
          placeholder="例如：前端工程师 / React Native 工程师"
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="none"
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.textPrimary
            }
          ]}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>简历内容</Text>
        <TextInput
          value={resumeText}
          onChangeText={setResumeText}
          placeholder="粘贴你的简历文本，至少 50 个字符"
          placeholderTextColor={theme.colors.textMuted}
          multiline
          textAlignVertical="top"
          autoCapitalize="none"
          style={[
            styles.input,
            styles.largeInput,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.textPrimary
            }
          ]}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>岗位 JD（可选）</Text>
        <TextInput
          value={jobDescription}
          onChangeText={setJobDescription}
          placeholder="粘贴岗位要求、职责或关键词"
          placeholderTextColor={theme.colors.textMuted}
          multiline
          textAlignVertical="top"
          autoCapitalize="none"
          style={[
            styles.input,
            styles.mediumInput,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.textPrimary
            }
          ]}
        />
      </View>

      {message && <Text style={[styles.body, { color: theme.colors.danger }]}>{message}</Text>}

      <View style={styles.actions}>
        <AppButton onPress={() => void handleSubmit()} disabled={isSubmitting}>
          {isSubmitting ? "诊断中..." : "开始诊断"}
        </AppButton>
        <AppButton
          variant="secondary"
          onPress={() =>
            router.push({
              pathname: "/model-config",
              params: { reason: "resume" }
            })
          }
        >
          去模型配置
        </AppButton>
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
  kicker: {
    fontSize: 14,
    fontWeight: "800"
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 36
  },
  body: {
    fontSize: 16,
    lineHeight: 24
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8
  },
  fieldGroup: {
    gap: 8
  },
  label: {
    fontSize: 15,
    fontWeight: "800"
  },
  input: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  mediumInput: {
    minHeight: 112
  },
  largeInput: {
    minHeight: 220
  },
  actions: {
    gap: 10
  }
});

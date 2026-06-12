import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { z } from "zod";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { Screen } from "@/components/Screen";
import {
  buildModelPreferences,
  getDefaultBaseUrl,
  getProviderLabel,
  ModelProviderId,
  modelConfigDraftSchema,
  modelProviderIds
} from "@/features/model-config/modelConfig";
import { useModelConfigStore } from "@/features/model-config/useModelConfigStore";
import { OpenAICompatibleProvider } from "@/providers/openAICompatibleProvider";
import { useTheme } from "@/theme/useTheme";

const reasonText: Record<string, string> = {
  interview: "开始面试前需要可用模型。",
  resume: "简历诊断需要可用模型。",
  settings: "配置你的 BYOK 模型服务。"
};

export default function ModelConfigScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ reason?: string }>();
  const { preferences, isLoading, errorMessage, load, save } = useModelConfigStore();
  const [provider, setProvider] = useState<ModelProviderId>("openai-compatible");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState(getDefaultBaseUrl("openai-compatible"));
  const [model, setModel] = useState("gpt-4o-mini");
  const [formMessage, setFormMessage] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (preferences) {
      setProvider(preferences.provider);
      setBaseUrl(preferences.baseUrl);
      setModel(preferences.model);
    }
  }, [preferences]);

  const helperText = useMemo(() => {
    return reasonText[params.reason ?? "settings"] ?? reasonText.settings;
  }, [params.reason]);

  const updateProvider = (nextProvider: ModelProviderId) => {
    setProvider(nextProvider);
    setBaseUrl(getDefaultBaseUrl(nextProvider));
  };

  const handleSave = async () => {
    setFormMessage(null);

    try {
      await save({
        provider,
        apiKey,
        baseUrl,
        model
      });
      setFormMessage("模型配置已保存。");
    } catch (error) {
      if (error instanceof z.ZodError) {
        setFormMessage(error.issues[0]?.message ?? "请检查模型配置。");
        return;
      }

      setFormMessage(error instanceof Error ? error.message : "保存失败。");
    }
  };

  const handleTestConnection = async () => {
    setFormMessage(null);

    try {
      const draft = modelConfigDraftSchema.parse({
        provider,
        apiKey,
        baseUrl,
        model
      });
      const preferences = buildModelPreferences(draft);

      const providerClient = new OpenAICompatibleProvider({
        apiKey: draft.apiKey,
        baseUrl: preferences.baseUrl,
        model: preferences.model
      });

      /**
       * Test before saving so an invalid key never becomes the active default
       * just because the form shape passed local validation.
       */
      await providerClient.testConnection();
      setFormMessage("连接测试通过，可以保存。");
    } catch (error) {
      if (error instanceof z.ZodError) {
        setFormMessage(error.issues[0]?.message ?? "请检查模型配置。");
        return;
      }

      setFormMessage(error instanceof Error ? error.message : "连接测试失败。");
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.colors.accent }]}>BYOK 模型配置</Text>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>连接你的模型服务</Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>{helperText}</Text>
      </View>

      <AppCard tone={preferences ? "success" : "info"}>
        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
          {preferences ? "当前已配置" : "尚未配置模型"}
        </Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          {preferences
            ? `${getProviderLabel(preferences.provider)} · ${preferences.model}`
            : "API Key 会写入系统安全存储，Base URL 和模型名只作为非敏感偏好保存。"}
        </Text>
      </AppCard>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>供应商</Text>
        <View style={styles.providerGrid}>
          {modelProviderIds.map((item) => {
            const isSelected = item === provider;

            return (
              <Pressable
                key={item}
                onPress={() => updateProvider(item)}
                style={[
                  styles.providerOption,
                  {
                    backgroundColor: isSelected ? theme.colors.accent : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.accent : theme.colors.border
                  }
                ]}
              >
                <Text style={{ color: isSelected ? "#FFFFFF" : theme.colors.textPrimary, fontWeight: "800" }}>
                  {getProviderLabel(item)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>API Key</Text>
        <TextInput
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="只保存在 expo-secure-store"
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry
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
        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Base URL</Text>
        <TextInput
          value={baseUrl}
          onChangeText={setBaseUrl}
          placeholder={getDefaultBaseUrl(provider)}
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
        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>模型名</Text>
        <TextInput
          value={model}
          onChangeText={setModel}
          placeholder="例如 gpt-4o-mini"
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

      {(formMessage || errorMessage) && (
        <Text style={[styles.body, { color: formMessage?.includes("通过") || formMessage?.includes("保存") ? theme.colors.success : theme.colors.danger }]}>
          {formMessage ?? errorMessage}
        </Text>
      )}

      <View style={styles.actions}>
        <AppButton onPress={handleSave} disabled={isLoading}>
          保存配置
        </AppButton>
        <AppButton variant="secondary" onPress={handleTestConnection}>
          测试连接
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
    fontWeight: "800"
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
  providerGrid: {
    gap: 10
  },
  providerOption: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 14
  },
  input: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14
  },
  actions: {
    gap: 10
  }
});

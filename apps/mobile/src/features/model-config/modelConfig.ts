import { z } from "zod";

export const modelProviderIds = ["openai-compatible", "qwen", "glm", "kimi"] as const;

export type ModelProviderId = (typeof modelProviderIds)[number];

export type ModelPreferences = {
  provider: ModelProviderId;
  baseUrl: string;
  model: string;
};

const defaultBaseUrls: Record<ModelProviderId, string> = {
  "openai-compatible": "https://api.openai.com/v1",
  qwen: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  glm: "https://open.bigmodel.cn/api/paas/v4",
  kimi: "https://api.moonshot.cn/v1"
};

const trimString = (value: unknown) => (typeof value === "string" ? value.trim() : value);

/**
 * The form schema trims user input at the boundary so storage, Provider
 * creation, and tests all consume the same normalized shape.
 */
export const modelConfigDraftSchema = z.object({
  provider: z.enum(modelProviderIds),
  apiKey: z.preprocess(trimString, z.string().min(1, "请输入 API Key")),
  baseUrl: z.preprocess(trimString, z.string()).optional(),
  model: z.preprocess(trimString, z.string().min(1, "请输入模型名"))
});

export type ModelConfigDraft = z.infer<typeof modelConfigDraftSchema>;

export function getDefaultBaseUrl(provider: ModelProviderId) {
  return defaultBaseUrls[provider];
}

export function buildModelPreferences(draft: ModelConfigDraft): ModelPreferences {
  return {
    provider: draft.provider,
    baseUrl: draft.baseUrl || getDefaultBaseUrl(draft.provider),
    model: draft.model
  };
}

export function getProviderLabel(provider: ModelProviderId) {
  const labels: Record<ModelProviderId, string> = {
    "openai-compatible": "OpenAI-compatible",
    qwen: "Qwen",
    glm: "GLM",
    kimi: "Kimi"
  };

  return labels[provider];
}

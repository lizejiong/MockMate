import * as SecureStore from "expo-secure-store";

import { ModelProviderId } from "@/features/model-config/modelConfig";

const modelApiKeyPrefix = "model_api_key";

/**
 * SecureStore 对 key 名有限制，不能使用冒号等命名空间分隔符。
 * 这里用点号隔离前缀和供应商，避免原生端保存时报 Invalid key。
 */
const getStorageKey = (provider: ModelProviderId) => `${modelApiKeyPrefix}.${provider}`;

export async function saveModelApiKey(provider: ModelProviderId, apiKey: string) {
  await SecureStore.setItemAsync(getStorageKey(provider), apiKey);
}

export async function getModelApiKey(provider: ModelProviderId) {
  return SecureStore.getItemAsync(getStorageKey(provider));
}

export async function deleteModelApiKey(provider: ModelProviderId) {
  await SecureStore.deleteItemAsync(getStorageKey(provider));
}

import * as SecureStore from "expo-secure-store";

import { ModelProviderId } from "@/features/model-config/modelConfig";

const modelApiKeyPrefix = "model-api-key";

const getStorageKey = (provider: ModelProviderId) => `${modelApiKeyPrefix}:${provider}`;

export async function saveModelApiKey(provider: ModelProviderId, apiKey: string) {
  await SecureStore.setItemAsync(getStorageKey(provider), apiKey);
}

export async function getModelApiKey(provider: ModelProviderId) {
  return SecureStore.getItemAsync(getStorageKey(provider));
}

export async function deleteModelApiKey(provider: ModelProviderId) {
  await SecureStore.deleteItemAsync(getStorageKey(provider));
}

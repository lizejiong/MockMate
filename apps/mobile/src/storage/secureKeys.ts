import * as SecureStore from "expo-secure-store";

const modelApiKeyPrefix = "model-api-key";

const getStorageKey = (provider: string) => `${modelApiKeyPrefix}:${provider}`;

export async function saveModelApiKey(provider: string, apiKey: string) {
  await SecureStore.setItemAsync(getStorageKey(provider), apiKey);
}

export async function getModelApiKey(provider: string) {
  return SecureStore.getItemAsync(getStorageKey(provider));
}

export async function deleteModelApiKey(provider: string) {
  await SecureStore.deleteItemAsync(getStorageKey(provider));
}

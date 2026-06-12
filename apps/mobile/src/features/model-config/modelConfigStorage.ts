import AsyncStorage from "@react-native-async-storage/async-storage";

import { deleteModelApiKey, getModelApiKey, saveModelApiKey } from "@/storage/secureKeys";

import { buildModelPreferences, ModelConfigDraft, ModelPreferences, modelConfigDraftSchema } from "./modelConfig";

const modelPreferencesKey = "model-preferences:v1";

export async function getModelPreferences() {
  const raw = await AsyncStorage.getItem(modelPreferencesKey);

  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as ModelPreferences;
}

export async function getActiveModelConfig() {
  const preferences = await getModelPreferences();

  if (!preferences) {
    return null;
  }

  const apiKey = await getModelApiKey(preferences.provider);

  if (!apiKey) {
    return null;
  }

  return {
    ...preferences,
    apiKey
  };
}

export async function saveModelConfig(input: ModelConfigDraft) {
  const draft = modelConfigDraftSchema.parse(input);
  const preferences = buildModelPreferences(draft);

  await saveModelApiKey(draft.provider, draft.apiKey);

  /**
   * API Key intentionally stays out of AsyncStorage. Non-sensitive preferences
   * are saved separately so status screens can load quickly without exposing secrets.
   */
  await AsyncStorage.setItem(modelPreferencesKey, JSON.stringify(preferences));

  return preferences;
}

export async function clearModelConfig(provider?: ModelPreferences["provider"]) {
  const preferences = await getModelPreferences();
  const providerToDelete = provider ?? preferences?.provider;

  if (providerToDelete) {
    await deleteModelApiKey(providerToDelete);
  }

  await AsyncStorage.removeItem(modelPreferencesKey);
}

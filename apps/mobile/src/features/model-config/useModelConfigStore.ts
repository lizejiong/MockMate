import { create } from "zustand";

import { clearModelConfig, getActiveModelConfig, getModelPreferences, saveModelConfig } from "./modelConfigStorage";
import { ModelConfigDraft, ModelPreferences } from "./modelConfig";

type ModelConfigState = {
  preferences: ModelPreferences | null;
  isLoading: boolean;
  errorMessage: string | null;
  load: () => Promise<void>;
  save: (draft: ModelConfigDraft) => Promise<void>;
  clear: () => Promise<void>;
  hasActiveConfig: () => Promise<boolean>;
};

export const useModelConfigStore = create<ModelConfigState>((set) => ({
  preferences: null,
  isLoading: false,
  errorMessage: null,
  load: async () => {
    set({ isLoading: true, errorMessage: null });

    try {
      const preferences = await getModelPreferences();
      set({ preferences, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : "读取模型配置失败"
      });
    }
  },
  save: async (draft) => {
    set({ isLoading: true, errorMessage: null });

    try {
      const preferences = await saveModelConfig(draft);
      set({ preferences, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : "保存模型配置失败"
      });
      throw error;
    }
  },
  clear: async () => {
    set({ isLoading: true, errorMessage: null });

    try {
      await clearModelConfig();
      set({ preferences: null, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : "清除模型配置失败"
      });
    }
  },
  hasActiveConfig: async () => {
    return Boolean(await getActiveModelConfig());
  }
}));

import { describe, expect, it } from "vitest";

import { buildModelPreferences, modelConfigDraftSchema } from "./modelConfig";

describe("model config validation", () => {
  it("normalizes provider settings while keeping the API key out of persisted preferences", () => {
    const draft = modelConfigDraftSchema.parse({
      provider: "openai-compatible",
      apiKey: "  sk-test  ",
      baseUrl: "",
      model: "  gpt-4o-mini  "
    });

    const preferences = buildModelPreferences(draft);

    expect(draft.apiKey).toBe("sk-test");
    expect(preferences).toEqual({
      provider: "openai-compatible",
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-4o-mini"
    });
    expect(JSON.stringify(preferences)).not.toContain("sk-test");
  });

  it("rejects incomplete model settings before anything can be persisted", () => {
    const result = modelConfigDraftSchema.safeParse({
      provider: "qwen",
      apiKey: "   ",
      baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      model: ""
    });

    expect(result.success).toBe(false);
  });
});

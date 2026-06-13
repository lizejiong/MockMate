import { beforeEach, describe, expect, it, vi } from "vitest";

import { saveModelApiKey } from "./secureKeys";

const secureStoreMock = vi.hoisted(() => ({
  setItemAsync: vi.fn()
}));

vi.mock("expo-secure-store", () => secureStoreMock);

describe("secureKeys", () => {
  beforeEach(() => {
    secureStoreMock.setItemAsync.mockClear();
  });

  it("uses SecureStore-compatible key names for model API keys", async () => {
    await saveModelApiKey("glm", "sk-test");

    const [[storageKey]] = secureStoreMock.setItemAsync.mock.calls;

    expect(storageKey).toBe("model_api_key.glm");
    expect(storageKey).toMatch(/^[A-Za-z0-9._-]+$/);
  });
});

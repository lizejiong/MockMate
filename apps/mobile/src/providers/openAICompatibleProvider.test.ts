import { describe, expect, it, vi } from "vitest";

import { OpenAICompatibleProvider } from "./openAICompatibleProvider";

describe("OpenAICompatibleProvider", () => {
  it("binds the default fetch to the global runtime on web", async () => {
    const originalFetch = globalThis.fetch;
    const strictFetch = vi.fn(async function (this: unknown) {
      if (this !== globalThis) {
        throw new TypeError("Illegal invocation");
      }

      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: "connected"
              }
            }
          ]
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json"
          }
        }
      );
    });

    globalThis.fetch = strictFetch as typeof fetch;

    try {
      const provider = new OpenAICompatibleProvider({
        apiKey: "sk-test",
        baseUrl: "https://api.example.com/v1",
        model: "mock-model"
      });

      await expect(provider.testConnection()).resolves.toBe(true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("sends an OpenAI-compatible chat request and returns assistant content", async () => {
    const fetchMock = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: "连接正常"
              }
            }
          ]
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json"
          }
        }
      );
    });

    const provider = new OpenAICompatibleProvider({
      apiKey: "sk-test",
      baseUrl: "https://api.example.com/v1",
      fetcher: fetchMock
    });

    const response = await provider.chat({
      model: "mock-model",
      messages: [{ role: "user", content: "ping" }],
      temperature: 0.2
    });

    expect(response.content).toBe("连接正常");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer sk-test",
          "content-type": "application/json"
        }),
        body: JSON.stringify({
          model: "mock-model",
          messages: [{ role: "user", content: "ping" }],
          temperature: 0.2
        })
      })
    );
  });
});

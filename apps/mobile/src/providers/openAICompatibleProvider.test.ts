import { describe, expect, it, vi } from "vitest";

import { OpenAICompatibleProvider } from "./openAICompatibleProvider";

describe("OpenAICompatibleProvider", () => {
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

import { ChatRequest, ChatResponse, ModelProvider } from "./modelProvider";

type Fetcher = typeof fetch;

type OpenAICompatibleProviderOptions = {
  apiKey: string;
  baseUrl: string;
  model?: string;
  fetcher?: Fetcher;
};

export class OpenAICompatibleProvider implements ModelProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model?: string;
  private readonly fetcher: Fetcher;

  constructor({ apiKey, baseUrl, model, fetcher = fetch }: OpenAICompatibleProviderOptions) {
    this.apiKey = apiKey;
    /** Normalize once so callers can paste Base URLs with trailing slashes. */
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.model = model;
    this.fetcher = fetcher;
  }

  async chat(input: ChatRequest): Promise<ChatResponse> {
    const response = await this.fetcher(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: input.model,
        messages: input.messages,
        temperature: input.temperature
      })
    });

    if (!response.ok) {
      throw new Error(`模型请求失败：${response.status}`);
    }

    const raw = await response.json();
    const content = raw?.choices?.[0]?.message?.content;

    if (typeof content !== "string" || content.length === 0) {
      throw new Error("模型响应缺少 assistant 内容");
    }

    return {
      content,
      raw
    };
  }

  async testConnection() {
    /**
     * Use a tiny chat request instead of a provider-specific models endpoint so
     * Qwen/GLM/Kimi can share the OpenAI-compatible adapter through Base URL.
     */
    const response = await this.chat({
      model: this.model ?? "test",
      messages: [{ role: "user", content: "ping" }],
      temperature: 0
    });

    return response.content.length > 0;
  }
}

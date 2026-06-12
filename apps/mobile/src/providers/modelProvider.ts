export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatRequest = {
  messages: ChatMessage[];
  model: string;
  temperature?: number;
};

export type ChatResponse = {
  content: string;
  raw?: unknown;
};

export interface ModelProvider {
  chat(input: ChatRequest): Promise<ChatResponse>;
  testConnection(): Promise<boolean>;
}

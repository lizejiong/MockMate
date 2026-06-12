import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { AiTaskRunner } from "./taskRunner";

const resultSchema = z.object({
  score: z.number(),
  summary: z.string()
});

const baseTask = {
  id: "test_task",
  model: "mock-model",
  temperature: 0.1,
  buildMessages: (input: { topic: string }) => [
    { role: "system" as const, content: "Return JSON only." },
    { role: "user" as const, content: input.topic }
  ],
  schema: resultSchema
};

describe("AiTaskRunner", () => {
  it("parses structured JSON responses through the task schema", async () => {
    const provider = {
      chat: vi.fn(async () => ({
        content: JSON.stringify({ score: 92, summary: "表达清晰" })
      })),
      testConnection: vi.fn()
    };
    const runner = new AiTaskRunner({ provider });

    const result = await runner.run(baseTask, { topic: "resume" });

    expect(result).toEqual({
      isStructured: true,
      data: { score: 92, summary: "表达清晰" },
      rawText: JSON.stringify({ score: 92, summary: "表达清晰" }),
      attempts: 1
    });
  });

  it("retries once with a correction instruction when structured output is invalid", async () => {
    const provider = {
      chat: vi
        .fn()
        .mockResolvedValueOnce({ content: "score: high" })
        .mockResolvedValueOnce({ content: JSON.stringify({ score: 86, summary: "已修正" }) }),
      testConnection: vi.fn()
    };
    const runner = new AiTaskRunner({ provider });

    const result = await runner.run(baseTask, { topic: "resume" });

    expect(result.isStructured).toBe(true);
    expect(result.data).toEqual({ score: 86, summary: "已修正" });
    expect(result.attempts).toBe(2);
    expect(provider.chat).toHaveBeenCalledTimes(2);
    expect(provider.chat.mock.calls[1][0].messages.at(-1)).toEqual({
      role: "user",
      content: expect.stringContaining("严格返回合法 JSON")
    });
  });

  it("falls back to raw text after two failed structured attempts", async () => {
    const provider = {
      chat: vi.fn(async () => ({ content: "无法结构化，但可以展示" })),
      testConnection: vi.fn()
    };
    const runner = new AiTaskRunner({ provider });

    const result = await runner.run(baseTask, { topic: "resume" });

    expect(result).toEqual({
      isStructured: false,
      data: null,
      rawText: "无法结构化，但可以展示",
      attempts: 2,
      errorMessage: expect.stringContaining("AI 输出结构校验失败")
    });
  });

  it("normalizes provider errors without exposing request internals", async () => {
    const provider = {
      chat: vi.fn(async () => {
        throw new Error("HTTP 401 sk-secret-token");
      }),
      testConnection: vi.fn()
    };
    const runner = new AiTaskRunner({ provider });

    await expect(runner.run(baseTask, { topic: "resume" })).rejects.toThrow("AI 任务 test_task 调用失败");
  });
});

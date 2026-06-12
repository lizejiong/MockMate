import { z } from "zod";

import { ChatMessage, ModelProvider } from "@/providers/modelProvider";

export type AiTaskDefinition<Input, Output> = {
  id: string;
  model: string;
  temperature?: number;
  buildMessages(input: Input): ChatMessage[];
  schema: z.ZodType<Output>;
};

export type StructuredAiTaskResult<Output> = {
  isStructured: true;
  data: Output;
  rawText: string;
  attempts: number;
};

export type FallbackAiTaskResult = {
  isStructured: false;
  data: null;
  rawText: string;
  attempts: number;
  errorMessage: string;
};

export type AiTaskResult<Output> = StructuredAiTaskResult<Output> | FallbackAiTaskResult;

type AiTaskRunnerOptions = {
  provider: ModelProvider;
};

const correctionMessage: ChatMessage = {
  role: "user",
  content: "上一次输出无法通过结构化校验。请严格返回合法 JSON，不要使用 Markdown，不要添加解释文字。"
};

export class AiTaskRunner {
  private readonly provider: ModelProvider;

  constructor({ provider }: AiTaskRunnerOptions) {
    this.provider = provider;
  }

  async run<Input, Output>(task: AiTaskDefinition<Input, Output>, input: Input): Promise<AiTaskResult<Output>> {
    const messages = task.buildMessages(input);

    try {
      const first = await this.callAndParse(task, messages, 1);

      if (first.isStructured) {
        return first;
      }

      /**
       * Keep correction retry inside the runner so every AI task gets identical
       * JSON repair behavior instead of each feature hand-rolling prompt fixes.
       */
      const second = await this.callAndParse(task, [...messages, correctionMessage], 2);

      if (second.isStructured) {
        return second;
      }

      return {
        ...second,
        rawText: second.rawText || first.rawText
      };
    } catch (error) {
      throw new Error(`AI 任务 ${task.id} 调用失败`, {
        cause: error
      });
    }
  }

  private async callAndParse<Input, Output>(
    task: AiTaskDefinition<Input, Output>,
    messages: ChatMessage[],
    attempts: number
  ): Promise<AiTaskResult<Output>> {
    const response = await this.provider.chat({
      model: task.model,
      temperature: task.temperature,
      messages
    });
    const parseResult = parseStructuredJson(response.content, task.schema);

    if (parseResult.success) {
      return {
        isStructured: true,
        data: parseResult.data,
        rawText: response.content,
        attempts
      };
    }

    return {
      isStructured: false,
      data: null,
      rawText: response.content,
      attempts,
      errorMessage: parseResult.errorMessage
    };
  }
}

function parseStructuredJson<Output>(rawText: string, schema: z.ZodType<Output>) {
  try {
    const parsedJson = JSON.parse(extractJsonText(rawText));
    const parsedData = schema.safeParse(parsedJson);

    if (!parsedData.success) {
      return {
        success: false as const,
        errorMessage: `AI 输出结构校验失败：${parsedData.error.issues[0]?.message ?? "字段不匹配"}`
      };
    }

    return {
      success: true as const,
      data: parsedData.data
    };
  } catch (error) {
    return {
      success: false as const,
      errorMessage: `AI 输出结构校验失败：${error instanceof Error ? error.message : "无法解析 JSON"}`
    };
  }
}

function extractJsonText(rawText: string) {
  const trimmed = rawText.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);

  return fenced?.[1]?.trim() ?? trimmed;
}

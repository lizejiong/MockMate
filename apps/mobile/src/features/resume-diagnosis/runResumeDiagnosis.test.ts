import { beforeEach, describe, expect, it, vi } from "vitest";

import { runResumeDiagnosis } from "./runResumeDiagnosis";

const storageMock = vi.hoisted(() => ({
  saveResumeDiagnosisRecord: vi.fn()
}));

const modelConfigMock = vi.hoisted(() => ({
  getActiveModelConfig: vi.fn()
}));

const providerMock = vi.hoisted(() => ({
  chat: vi.fn(),
  testConnection: vi.fn()
}));

const providerConstructorMock = vi.hoisted(() =>
  vi.fn(function () {
    return providerMock;
  })
);

vi.mock("./resumeDiagnosisStorage", () => storageMock);
vi.mock("../model-config/modelConfigStorage", () => modelConfigMock);
vi.mock("../../providers/openAICompatibleProvider", () => ({
  OpenAICompatibleProvider: providerConstructorMock
}));

describe("runResumeDiagnosis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires an active model config", async () => {
    modelConfigMock.getActiveModelConfig.mockResolvedValue(null);

    await expect(
      runResumeDiagnosis({
        resumeText: "这是一段超过五十字的简历内容，用来验证没有模型配置时不会发起 AI 调用。",
        targetRole: "前端工程师"
      })
    ).rejects.toThrow("请先配置可用模型");
  });

  it("runs the AI task with configured model and stores structured diagnosis", async () => {
    modelConfigMock.getActiveModelConfig.mockResolvedValue({
      provider: "glm",
      apiKey: "sk-test",
      baseUrl: "https://open.bigmodel.cn/api/paas/v4",
      model: "glm-5.1"
    });
    providerMock.chat.mockResolvedValue({
      content: JSON.stringify({
        id: "ai-id",
        createdAt: 100,
        overallScore: 82,
        summary: "项目表达较完整，但量化结果不足。",
        issues: [
          {
            section: "项目经历",
            originalText: "负责性能优化",
            problem: "缺少指标",
            suggestion: "补充优化前后数据",
            improvedExample: "将首屏耗时从 3.2s 降至 1.8s",
            severity: "medium"
          }
        ],
        missingSignals: ["量化指标"],
        recommendedInterviewFocus: ["性能优化细节"]
      })
    });

    const record = await runResumeDiagnosis({
      resumeText: "  这是一段超过五十字的简历内容，描述项目经历、技术方案、个人职责和结果。  ",
      targetRole: " 前端工程师 ",
      jobDescription: ""
    });

    expect(providerConstructorMock).toHaveBeenCalledWith({
      apiKey: "sk-test",
      baseUrl: "https://open.bigmodel.cn/api/paas/v4",
      model: "glm-5.1"
    });
    expect(providerMock.chat).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "glm-5.1"
      })
    );
    expect(record.result.isStructured).toBe(true);
    expect(record.input).toEqual({
      resumeText: "这是一段超过五十字的简历内容，描述项目经历、技术方案、个人职责和结果。",
      targetRole: "前端工程师",
      jobDescription: undefined
    });
    expect(storageMock.saveResumeDiagnosisRecord).toHaveBeenCalledWith(record);
  });

  it("stores fallback diagnosis when structured parsing fails", async () => {
    modelConfigMock.getActiveModelConfig.mockResolvedValue({
      provider: "glm",
      apiKey: "sk-test",
      baseUrl: "https://open.bigmodel.cn/api/paas/v4",
      model: "glm-5.1"
    });
    providerMock.chat.mockResolvedValue({
      content: "这是一段非 JSON 诊断结果"
    });

    const record = await runResumeDiagnosis({
      resumeText: "这是一段超过五十字的简历内容，用来验证结构化失败时也会保存 fallback 诊断结果。",
      targetRole: "前端工程师"
    });

    expect(record.result.isStructured).toBe(false);
    expect(storageMock.saveResumeDiagnosisRecord).toHaveBeenCalledWith(record);
  });
});

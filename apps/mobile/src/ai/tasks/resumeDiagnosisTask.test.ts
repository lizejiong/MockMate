import { describe, expect, it } from "vitest";

import { resumeDiagnosisTask, resumeDiagnosisSchema } from "./resumeDiagnosisTask";

describe("resumeDiagnosisTask", () => {
  it("builds prompt messages without leaking UI concerns into the task contract", () => {
    const messages = resumeDiagnosisTask.buildMessages({
      resumeText: "负责 React Native 性能优化",
      targetRole: "React Native 工程师",
      jobDescription: "要求性能优化和跨端经验"
    });

    expect(messages[0]).toEqual({
      role: "system",
      content: expect.stringContaining("简历诊断")
    });
    expect(messages[1].content).toContain("负责 React Native 性能优化");
    expect(messages[1].content).toContain("React Native 工程师");
    expect(messages[1].content).toContain("要求性能优化和跨端经验");
  });

  it("validates the structured resume diagnosis result shape", () => {
    const parsed = resumeDiagnosisSchema.parse({
      id: "diag_1",
      createdAt: 1781270000000,
      overallScore: 78,
      summary: "项目表达有基础，但缺少结果证据。",
      issues: [
        {
          section: "项目经历",
          originalText: "做了性能优化",
          problem: "缺少量化指标",
          suggestion: "补充优化前后数据",
          improvedExample: "将启动耗时从 3.2s 降至 1.8s",
          severity: "high"
        }
      ],
      missingSignals: ["业务背景", "量化结果"],
      recommendedInterviewFocus: ["性能优化取舍"]
    });

    expect(parsed.overallScore).toBe(78);
  });
});

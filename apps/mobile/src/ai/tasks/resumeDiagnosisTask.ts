import { z } from "zod";

import { AiTaskDefinition } from "@/ai/taskRunner";

export const resumeDiagnosisSchema = z.object({
  id: z.string().min(1),
  createdAt: z.number(),
  overallScore: z.number().min(0).max(100),
  summary: z.string().min(1),
  issues: z
    .array(
      z.object({
        section: z.string().min(1),
        originalText: z.string().min(1),
        problem: z.string().min(1),
        suggestion: z.string().min(1),
        improvedExample: z.string().min(1),
        severity: z.enum(["low", "medium", "high"])
      })
    )
    .min(1),
  missingSignals: z.array(z.string().min(1)),
  recommendedInterviewFocus: z.array(z.string().min(1))
});

export type ResumeDiagnosis = z.infer<typeof resumeDiagnosisSchema>;

export type ResumeDiagnosisInput = {
  resumeText: string;
  targetRole?: string;
  jobDescription?: string;
};

const systemPrompt = [
  "你是资深技术面试官和简历教练，负责做简历诊断。",
  "只返回 JSON，不要返回 Markdown、解释文字或额外字段。",
  "诊断必须具体、可执行，优先指出项目表达、个人职责、技术难点、量化结果、业务背景和岗位匹配问题。",
  "overallScore 使用 0-100 分；severity 只能是 low、medium、high。"
].join("\n");

const buildUserPrompt = ({ resumeText, targetRole, jobDescription }: ResumeDiagnosisInput) => {
  return [
    `目标岗位：${targetRole?.trim() || "未指定"}`,
    `岗位 JD：${jobDescription?.trim() || "未提供"}`,
    "简历内容：",
    resumeText.trim(),
    "",
    "请返回符合以下 TypeScript 结构的 JSON：",
    `{
  "id": "string",
  "createdAt": number,
  "overallScore": number,
  "summary": "string",
  "issues": [{
    "section": "string",
    "originalText": "string",
    "problem": "string",
    "suggestion": "string",
    "improvedExample": "string",
    "severity": "low" | "medium" | "high"
  }],
  "missingSignals": ["string"],
  "recommendedInterviewFocus": ["string"]
}`
  ].join("\n");
};

export const resumeDiagnosisTask: AiTaskDefinition<ResumeDiagnosisInput, ResumeDiagnosis> = {
  id: "resume_diagnosis",
  model: "default",
  temperature: 0.2,
  buildMessages: (input) => [
    {
      role: "system",
      content: systemPrompt
    },
    {
      role: "user",
      content: buildUserPrompt(input)
    }
  ],
  schema: resumeDiagnosisSchema
};

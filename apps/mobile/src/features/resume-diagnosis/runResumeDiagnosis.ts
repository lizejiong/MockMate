import { AiTaskRunner } from "../../ai/taskRunner";
import { ResumeDiagnosisInput, resumeDiagnosisTask } from "../../ai/tasks/resumeDiagnosisTask";
import { getActiveModelConfig } from "../model-config/modelConfigStorage";
import { OpenAICompatibleProvider } from "../../providers/openAICompatibleProvider";

import { saveResumeDiagnosisRecord, StoredResumeDiagnosisRecord } from "./resumeDiagnosisStorage";

export async function runResumeDiagnosis(input: ResumeDiagnosisInput) {
  const activeConfig = await getActiveModelConfig();

  if (!activeConfig) {
    throw new Error("请先配置可用模型，再进行简历诊断。");
  }

  const provider = new OpenAICompatibleProvider({
    apiKey: activeConfig.apiKey,
    baseUrl: activeConfig.baseUrl,
    model: activeConfig.model
  });
  const runner = new AiTaskRunner({ provider });
  const normalizedInput = {
    resumeText: input.resumeText.trim(),
    targetRole: input.targetRole?.trim() || undefined,
    jobDescription: input.jobDescription?.trim() || undefined
  };
  /**
   * Task definitions keep prompts and schema stable, but BYOK users choose the
   * real model at runtime. Overriding here prevents the placeholder model from
   * leaking into provider requests.
   */
  const result = await runner.run({ ...resumeDiagnosisTask, model: activeConfig.model }, normalizedInput);
  const id = result.isStructured ? result.data.id : `resume-diagnosis-${Date.now()}`;
  const createdAt = result.isStructured ? result.data.createdAt : Date.now();
  const record: StoredResumeDiagnosisRecord = {
    id,
    createdAt,
    input: normalizedInput,
    result
  };

  /**
   * 诊断结果可能用于历史、面试入口和学习模式。编排层统一保存，页面只负责跳转，
   * 避免不同入口重复实现保存逻辑或遗漏 fallback 结果。
   */
  await saveResumeDiagnosisRecord(record);

  return record;
}

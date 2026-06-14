import AsyncStorage from "@react-native-async-storage/async-storage";

import { AiTaskResult } from "@/ai/taskRunner";
import { ResumeDiagnosis, ResumeDiagnosisInput } from "@/ai/tasks/resumeDiagnosisTask";

const resumeDiagnosisRecordsKey = "resume-diagnosis-records:v1";
const maxStoredRecords = 20;

export type StoredResumeDiagnosisRecord = {
  id: string;
  createdAt: number;
  input: ResumeDiagnosisInput;
  result: AiTaskResult<ResumeDiagnosis>;
};

export async function getResumeDiagnosisRecords() {
  const raw = await AsyncStorage.getItem(resumeDiagnosisRecordsKey);

  if (!raw) {
    return [];
  }

  return JSON.parse(raw) as StoredResumeDiagnosisRecord[];
}

export async function getResumeDiagnosisRecord(id: string) {
  const records = await getResumeDiagnosisRecords();

  return records.find((record) => record.id === id) ?? null;
}

export async function saveResumeDiagnosisRecord(record: StoredResumeDiagnosisRecord) {
  const records = await getResumeDiagnosisRecords();
  /**
   * 诊断记录会携带简历正文，不能无限增长。按时间倒序裁剪，既满足最近历史展示，
   * 也避免 AsyncStorage 被大文本长期占满。
   */
  const nextRecords = [record, ...records.filter((item) => item.id !== record.id)]
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, maxStoredRecords);

  await AsyncStorage.setItem(resumeDiagnosisRecordsKey, JSON.stringify(nextRecords));

  return record;
}

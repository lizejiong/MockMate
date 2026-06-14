import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getResumeDiagnosisRecord,
  getResumeDiagnosisRecords,
  saveResumeDiagnosisRecord,
  StoredResumeDiagnosisRecord
} from "./resumeDiagnosisStorage";

vi.mock("@react-native-async-storage/async-storage", () => {
  const store = new Map<string, string>();

  return {
    default: {
      getItem: vi.fn(async (key: string) => store.get(key) ?? null),
      setItem: vi.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
      removeItem: vi.fn(async (key: string) => {
        store.delete(key);
      }),
      clear: vi.fn(async () => {
        store.clear();
      })
    }
  };
});

function createRecord(id: string, createdAt: number): StoredResumeDiagnosisRecord {
  return {
    id,
    createdAt,
    input: {
      resumeText: "这是一段超过五十字的简历文本，用于测试本地诊断记录保存，不包含任何 API Key。",
      targetRole: "前端工程师"
    },
    result: {
      isStructured: true,
      data: {
        id,
        createdAt,
        overallScore: 80,
        summary: "表达清晰，但量化结果不足。",
        issues: [
          {
            section: "项目经历",
            originalText: "负责系统开发",
            problem: "职责描述过泛",
            suggestion: "补充个人职责和结果",
            improvedExample: "负责核心模块并将首屏耗时降低 30%",
            severity: "medium"
          }
        ],
        missingSignals: ["量化结果"],
        recommendedInterviewFocus: ["项目职责边界"]
      },
      rawText: "{}",
      attempts: 1
    }
  };
}

describe("resumeDiagnosisStorage", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("saves records newest first and reads a record by id", async () => {
    await saveResumeDiagnosisRecord(createRecord("old", 1));
    await saveResumeDiagnosisRecord(createRecord("new", 2));

    const records = await getResumeDiagnosisRecords();
    const selected = await getResumeDiagnosisRecord("old");

    expect(records.map((record) => record.id)).toEqual(["new", "old"]);
    expect(selected?.id).toBe("old");
  });

  it("keeps only the latest 20 records", async () => {
    for (let index = 0; index < 25; index += 1) {
      await saveResumeDiagnosisRecord(createRecord(`record-${index}`, index));
    }

    const records = await getResumeDiagnosisRecords();

    expect(records).toHaveLength(20);
    expect(records[0]?.id).toBe("record-24");
    expect(records.at(-1)?.id).toBe("record-5");
  });

  it("returns empty values when storage has no matching record", async () => {
    await expect(getResumeDiagnosisRecords()).resolves.toEqual([]);
    await expect(getResumeDiagnosisRecord("missing")).resolves.toBeNull();
  });
});

# 简历诊断闭环实施计划

> **给 agentic workers：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 按任务逐项执行本计划。步骤使用 checkbox（`- [ ]`）语法跟踪状态。

**目标：** 实现独立的简历诊断闭环：模型配置检查、简历输入、AI 诊断调用、结构化结果展示和本地记录保存。

**架构：** 页面层只处理输入、跳转和渲染；`features/resume-diagnosis` 负责本地记录和诊断编排；AI 调用继续复用 `AiTaskRunner`、`resumeDiagnosisTask` 和 `OpenAICompatibleProvider`。API Key 只从现有模型配置读取，不写入诊断记录。

**技术栈：** Expo Router、React Native、TypeScript、Zustand、AsyncStorage、Vitest、Zod、现有 Provider Adapter。

---

## 文件结构

**新建：**

- `apps/mobile/src/features/resume-diagnosis/resumeDiagnosisStorage.ts`
- `apps/mobile/src/features/resume-diagnosis/resumeDiagnosisStorage.test.ts`
- `apps/mobile/src/features/resume-diagnosis/runResumeDiagnosis.ts`
- `apps/mobile/src/features/resume-diagnosis/runResumeDiagnosis.test.ts`
- `apps/mobile/app/resume-diagnosis.tsx`
- `apps/mobile/app/resume-diagnosis-result.tsx`

**修改：**

- `apps/mobile/app/(tabs)/index.tsx`

**复用：**

- `apps/mobile/src/ai/taskRunner.ts`
- `apps/mobile/src/ai/tasks/resumeDiagnosisTask.ts`
- `apps/mobile/src/features/model-config/modelConfigStorage.ts`
- `apps/mobile/src/providers/openAICompatibleProvider.ts`
- `apps/mobile/src/components/Screen.tsx`
- `apps/mobile/src/components/AppCard.tsx`
- `apps/mobile/src/components/AppButton.tsx`

## 任务 1：实现诊断记录本地存储

**文件：**

- 新建：`apps/mobile/src/features/resume-diagnosis/resumeDiagnosisStorage.test.ts`
- 新建：`apps/mobile/src/features/resume-diagnosis/resumeDiagnosisStorage.ts`

- [ ] **步骤 1：编写失败测试**

创建 `apps/mobile/src/features/resume-diagnosis/resumeDiagnosisStorage.test.ts`：

```ts
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
```

- [ ] **步骤 2：运行测试，确认它按预期失败**

运行：

```bash
pnpm.cmd --dir apps/mobile test src/features/resume-diagnosis/resumeDiagnosisStorage.test.ts
```

预期：失败，原因是 `resumeDiagnosisStorage.ts` 还不存在。

- [ ] **步骤 3：实现存储模块**

创建 `apps/mobile/src/features/resume-diagnosis/resumeDiagnosisStorage.ts`：

```ts
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
```

- [ ] **步骤 4：运行测试，确认它通过**

运行：

```bash
pnpm.cmd --dir apps/mobile test src/features/resume-diagnosis/resumeDiagnosisStorage.test.ts
```

预期：3 个测试通过。

## 任务 2：实现简历诊断编排函数

**文件：**

- 新建：`apps/mobile/src/features/resume-diagnosis/runResumeDiagnosis.test.ts`
- 新建：`apps/mobile/src/features/resume-diagnosis/runResumeDiagnosis.ts`

- [ ] **步骤 1：编写失败测试**

创建 `apps/mobile/src/features/resume-diagnosis/runResumeDiagnosis.test.ts`：

```ts
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

vi.mock("./resumeDiagnosisStorage", () => storageMock);
vi.mock("@/features/model-config/modelConfigStorage", () => modelConfigMock);
vi.mock("@/providers/openAICompatibleProvider", () => ({
  OpenAICompatibleProvider: vi.fn(() => providerMock)
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

  it("runs the AI task and stores structured diagnosis", async () => {
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
      resumeText: "这是一段超过五十字的简历内容，描述项目经历、技术方案、个人职责和结果。",
      targetRole: "前端工程师"
    });

    expect(record.result.isStructured).toBe(true);
    expect(record.input.targetRole).toBe("前端工程师");
    expect(storageMock.saveResumeDiagnosisRecord).toHaveBeenCalledWith(record);
  });
});
```

- [ ] **步骤 2：运行测试，确认它按预期失败**

运行：

```bash
pnpm.cmd --dir apps/mobile test src/features/resume-diagnosis/runResumeDiagnosis.test.ts
```

预期：失败，原因是 `runResumeDiagnosis.ts` 还不存在。

- [ ] **步骤 3：实现编排函数**

创建 `apps/mobile/src/features/resume-diagnosis/runResumeDiagnosis.ts`：

```ts
import { AiTaskRunner } from "@/ai/taskRunner";
import { ResumeDiagnosisInput, resumeDiagnosisTask } from "@/ai/tasks/resumeDiagnosisTask";
import { getActiveModelConfig } from "@/features/model-config/modelConfigStorage";
import { OpenAICompatibleProvider } from "@/providers/openAICompatibleProvider";

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
  const result = await runner.run(resumeDiagnosisTask, normalizedInput);
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
```

- [ ] **步骤 4：运行测试，确认它通过**

运行：

```bash
pnpm.cmd --dir apps/mobile test src/features/resume-diagnosis/runResumeDiagnosis.test.ts
```

预期：2 个测试通过。

## 任务 3：新增简历诊断输入页

**文件：**

- 新建：`apps/mobile/app/resume-diagnosis.tsx`

- [ ] **步骤 1：创建页面**

创建 `apps/mobile/app/resume-diagnosis.tsx`。页面必须包含：

- `resumeText` 多行输入。
- `targetRole` 单行输入。
- `jobDescription` 多行输入。
- 本地错误提示。
- 提交中禁用按钮。
- 成功后跳转 `/resume-diagnosis-result?id=<id>`。
- 错误时展示可理解信息和“去模型配置”入口。

核心提交逻辑使用以下代码：

```ts
const handleSubmit = async () => {
  const normalizedResumeText = resumeText.trim();

  if (normalizedResumeText.length < 50) {
    setMessage("请粘贴至少 50 个字符的简历内容，方便模型给出有效诊断。");
    return;
  }

  setIsSubmitting(true);
  setMessage(null);

  try {
    const record = await runResumeDiagnosis({
      resumeText: normalizedResumeText,
      targetRole,
      jobDescription
    });

    router.push({
      pathname: "/resume-diagnosis-result",
      params: { id: record.id }
    });
  } catch (error) {
    setMessage(error instanceof Error ? error.message : "简历诊断失败，请稍后重试。");
  } finally {
    setIsSubmitting(false);
  }
};
```

- [ ] **步骤 2：页面样式约束**

使用现有组件和主题：

```ts
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { Screen } from "@/components/Screen";
import { runResumeDiagnosis } from "@/features/resume-diagnosis/runResumeDiagnosis";
import { useTheme } from "@/theme/useTheme";
```

样式要求：

- 颜色全部来自 `theme.colors`。
- 输入框使用 `theme.colors.surface`、`theme.colors.border`、`theme.colors.textPrimary`。
- 多行输入使用固定 `minHeight`，避免内容为空时布局塌陷。

- [ ] **步骤 3：运行类型检查**

运行：

```bash
pnpm.cmd mobile:typecheck
```

预期：通过。

## 任务 4：新增简历诊断结果页

**文件：**

- 新建：`apps/mobile/app/resume-diagnosis-result.tsx`

- [ ] **步骤 1：创建结果页**

创建 `apps/mobile/app/resume-diagnosis-result.tsx`。页面必须：

- 使用 `useLocalSearchParams<{ id?: string }>()` 获取 id。
- 调用 `getResumeDiagnosisRecord(id)` 读取本地记录。
- loading 时展示读取状态。
- id 缺失或记录不存在时展示空状态。
- structured 结果展示总分、总结、问题列表、缺失信号和推荐关注点。
- fallback 结果展示 `errorMessage` 与 `rawText`。

记录读取核心逻辑：

```ts
useEffect(() => {
  let isMounted = true;

  async function loadRecord() {
    if (!id) {
      setRecord(null);
      setIsLoading(false);
      return;
    }

    const nextRecord = await getResumeDiagnosisRecord(id);

    if (isMounted) {
      setRecord(nextRecord);
      setIsLoading(false);
    }
  }

  void loadRecord();

  return () => {
    isMounted = false;
  };
}, [id]);
```

- [ ] **步骤 2：实现结构化渲染**

结构化分支渲染：

```tsx
if (record.result.isStructured) {
  const diagnosis = record.result.data;

  return (
    <>
      <AppCard tone="success">
        <Text>综合评分：{diagnosis.overallScore}/100</Text>
        <Text>{diagnosis.summary}</Text>
      </AppCard>
      {diagnosis.issues.map((issue) => (
        <AppCard key={`${issue.section}-${issue.originalText}`} tone={issue.severity === "high" ? "danger" : "default"}>
          <Text>{issue.section}</Text>
          <Text>{issue.problem}</Text>
          <Text>{issue.suggestion}</Text>
          <Text>{issue.improvedExample}</Text>
        </AppCard>
      ))}
    </>
  );
}
```

实际实现时需要给每个 `Text` 应用 theme 样式，不能裸用默认颜色。

- [ ] **步骤 3：实现 fallback 渲染**

fallback 分支渲染：

```tsx
<AppCard tone="warning">
  <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>模型返回了非结构化结果</Text>
  <Text style={[styles.body, { color: theme.colors.textSecondary }]}>{record.result.errorMessage}</Text>
  <Text style={[styles.rawText, { color: theme.colors.textPrimary }]}>{record.result.rawText}</Text>
</AppCard>
```

- [ ] **步骤 4：运行类型检查**

运行：

```bash
pnpm.cmd mobile:typecheck
```

预期：通过。

## 任务 5：首页入口接入独立诊断页

**文件：**

- 修改：`apps/mobile/app/(tabs)/index.tsx`

- [ ] **步骤 1：修改跳转逻辑**

当前 `requireModelConfig("resume")` 配置可用后会跳转 `/interview`。改成根据 reason 决定目标页：

```ts
const requireModelConfig = async (reason: "interview" | "resume") => {
  const isConfigured = await hasActiveConfig();

  if (!isConfigured) {
    router.push({
      pathname: "/model-config",
      params: { reason }
    });
    return;
  }

  router.push(reason === "resume" ? "/resume-diagnosis" : "/interview");
};
```

- [ ] **步骤 2：运行类型检查**

运行：

```bash
pnpm.cmd mobile:typecheck
```

预期：通过。

## 任务 6：全量验证

**文件：**

- 涉及本计划全部新建和修改文件。

- [ ] **步骤 1：运行单元测试**

运行：

```bash
pnpm.cmd mobile:test
```

预期：

- 所有现有测试继续通过。
- 新增 `resumeDiagnosisStorage.test.ts` 和 `runResumeDiagnosis.test.ts` 通过。

- [ ] **步骤 2：运行类型检查**

运行：

```bash
pnpm.cmd mobile:typecheck
```

预期：通过。

- [ ] **步骤 3：运行 lint**

运行：

```bash
pnpm.cmd mobile:lint
```

预期：通过。

- [ ] **步骤 4：手动验证 Web / Expo Go**

运行：

```bash
pnpm mobile:start
```

手动检查：

- 首页点击“简历诊断”。
- 无模型配置时进入模型配置页。
- 有模型配置时进入 `/resume-diagnosis`。
- 简历文本少于 50 字时显示本地校验错误。
- 有效输入提交后进入结果页。
- 结果页能展示结构化结果或 fallback 文本。

## 执行交接

计划已完成并保存到 `docs/superpowers/plans/2026-06-13-resume-diagnosis-flow.md`。有两个执行选项：

**1. Subagent-Driven（推荐）** - 每个任务派发一个新的 subagent，任务之间做 review，迭代更快。

**2. Inline Execution** - 在当前会话中使用 executing-plans 执行，按批次推进并设置检查点。

本项目 `AGENTS.md` 规定不要提交 Git，除非用户明确要求；因此执行计划时只在用户要求提交后才创建 commit。

# 简历诊断闭环设计

## 目标

把现有模型配置、OpenAI-compatible Provider、`AiTaskRunner` 和 `resumeDiagnosisTask` 串成第一个真实可用的 AI 功能闭环。用户完成 BYOK 模型配置后，可以粘贴简历文本，填写目标岗位和可选 JD，获得结构化简历诊断结果，并在本地保存诊断记录，供后续历史、面试入口和学习模式复用。

## 范围

本轮实现：

- 首页“简历诊断”入口在模型配置可用时进入独立诊断页。
- 新增简历诊断输入页，支持粘贴简历文本、目标岗位、可选 JD。
- 调用现有 `resumeDiagnosisTask`，展示结构化诊断结果。
- 结构化失败时展示 fallback 原文和可理解错误，不让页面崩溃。
- 本地保存诊断记录；API Key 仍只通过 `expo-secure-store` 读取，不写入普通存储。
- 新增结果页，展示评分、总结、问题列表、缺失信号和推荐面试关注点。

本轮不实现：

- PDF 解析、图片 OCR、复杂简历排版编辑。
- 从诊断结果直接启动完整聊天面试。
- 学习模式、历史详情、报告生成和弱点趋势统计。
- 服务端、账号、云同步或统一模型代理。

## 用户流程

```text
首页
→ 点击“简历诊断”
→ 若无模型配置，跳转模型配置页并带 reason=resume
→ 若模型配置可用，进入 /resume-diagnosis
→ 用户输入简历文本、目标岗位、可选 JD
→ 点击“开始诊断”
→ 页面进入 loading 状态
→ 读取当前模型配置和 API Key
→ 构建 OpenAICompatibleProvider 与 AiTaskRunner
→ 调用 resumeDiagnosisTask
→ 保存诊断记录
→ 跳转 /resume-diagnosis-result?id=<diagnosisId>
→ 展示结构化结果或 fallback 文本
```

## 架构设计

### 页面层

- `apps/mobile/app/resume-diagnosis.tsx`
  - 负责表单输入、基础校验、触发诊断、展示提交状态和错误。
  - 不直接拼 prompt，不直接解析 AI 输出。
- `apps/mobile/app/resume-diagnosis-result.tsx`
  - 根据 `id` 读取本地诊断记录。
  - 负责结果渲染和空状态处理。

### Feature 层

- `apps/mobile/src/features/resume-diagnosis/resumeDiagnosisStorage.ts`
  - 负责保存、读取最近诊断记录和按 id 读取单条记录。
  - 使用 AsyncStorage 保存非敏感业务数据。
- `apps/mobile/src/features/resume-diagnosis/runResumeDiagnosis.ts`
  - 负责把模型配置、Provider、`AiTaskRunner` 和 `resumeDiagnosisTask` 编排起来。
  - 页面只调用这个函数，避免把 AI 调用细节散落到 UI。

### AI 层

继续复用：

- `apps/mobile/src/ai/taskRunner.ts`
- `apps/mobile/src/ai/tasks/resumeDiagnosisTask.ts`
- `apps/mobile/src/providers/openAICompatibleProvider.ts`

本轮不新增 provider 类型。Qwen、GLM、Kimi 仍通过 OpenAI-compatible Base URL 走同一个 adapter。

## 数据模型

诊断记录需要兼容结构化成功和 fallback：

```ts
type StoredResumeDiagnosisRecord = {
  id: string;
  createdAt: number;
  input: {
    resumeText: string;
    targetRole?: string;
    jobDescription?: string;
  };
  result:
    | {
        isStructured: true;
        data: ResumeDiagnosis;
        rawText: string;
        attempts: number;
      }
    | {
        isStructured: false;
        data: null;
        rawText: string;
        attempts: number;
        errorMessage: string;
      };
};
```

保存策略：

- 使用 `resume-diagnosis-records:v1` 作为 AsyncStorage key。
- 先保存数组，按 `createdAt` 倒序排列。
- 为避免本地存储无限增长，最多保留最近 20 条。
- API Key 不进入记录，不进入日志，不进入 AsyncStorage。

## 输入校验

输入页做本地校验：

- `resumeText` trim 后至少 50 个字符，避免空内容或过短内容浪费模型调用。
- `targetRole` 和 `jobDescription` 可选，提交前统一 trim。
- 诊断过程中禁用提交按钮，防止重复请求。

## 错误处理

- 无模型配置：跳转模型配置页，保留 `reason=resume`。
- 模型请求失败：展示“模型调用失败，请检查 API Key、Base URL、模型名或网络状态”，并提供跳转模型配置页入口。
- AI 输出结构化失败：保存 fallback 结果，结果页展示原始文本和错误提示。
- 本地保存失败：不丢弃当前结果，页面展示保存失败提示，并允许用户重试诊断。
- 结果 id 不存在：结果页展示空状态并提供返回诊断页按钮。

## UI 设计

输入页：

- 顶部说明简历诊断用途。
- 使用 `TextInput` 多行输入简历文本。
- 目标岗位和 JD 用普通输入框。
- 使用现有 `Screen`、`AppCard`、`AppButton` 和 `useTheme()`。
- 不硬编码主题色。

结果页：

- 总分和总结放在顶部。
- 问题列表按 severity 视觉区分，但颜色仍来自 theme token。
- 每个问题展示：所在部分、原文、问题、建议、优化示例。
- 缺失信号和推荐面试关注点分别用卡片展示。
- fallback 结果展示原始文本，不尝试假装结构化成功。

## 测试策略

单元测试：

- `resumeDiagnosisStorage.test.ts`
  - 保存记录后可按 id 读取。
  - 超过 20 条时只保留最近 20 条。
  - 读取空存储返回空数组或 null。
- `runResumeDiagnosis.test.ts`
  - 无 active model config 时抛出可理解错误。
  - 结构化成功时保存 structured 记录。
  - fallback 结果也会保存。

页面测试当前项目未引入 React Native Testing Library，本轮不新增复杂 UI 测试依赖。页面行为通过类型检查、lint、单元测试和 Expo Go / Web 手动验证覆盖。

## 验收标准

- 有模型配置时，从首页点击“简历诊断”进入独立诊断页。
- 无模型配置时，仍进入模型配置页。
- 输入有效简历文本后可以触发 AI 诊断。
- 成功时结果页展示总分、总结、问题列表、缺失信号和推荐关注点。
- AI 输出无法结构化时，结果页展示 fallback 文本和错误说明，不崩溃。
- 诊断记录写入本地，且不包含 API Key。
- `pnpm mobile:test`、`pnpm mobile:typecheck`、`pnpm mobile:lint` 通过。

## 自检

- 无未决占位内容。
- 范围聚焦在简历诊断闭环，没有扩大到完整面试系统。
- 数据流明确区分 API Key 安全存储和普通业务数据存储。
- 错误处理覆盖模型配置缺失、模型调用失败、结构化失败、保存失败和结果不存在。

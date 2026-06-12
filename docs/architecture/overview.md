# 架构概览

## 技术选型

选择 Expo React Native + TypeScript + Expo Router，是为了在移动端保持较低原生维护成本，同时保留后续真实上架、文件能力、安全存储和路由扩展空间。

TypeScript 用于约束 AI 输出、面试设置、报告、学习档案等核心数据结构。Expo Router 让页面结构与文件结构保持一致，适合从 MVP 逐步扩展到完整业务流。

## Monorepo

项目使用 pnpm workspace：

```text
apps/mobile  移动端 App
packages     后续共享逻辑、prompt、schema 或工具包
```

当前阶段只有 mobile 应用，`packages` 先作为边界预留。

## Mobile 目录职责

- `app`: Expo Router 页面和布局。
- `src/components`: 可复用基础组件。
- `src/theme`: 主题 token、Provider 和 hook。
- `src/providers`: 模型调用抽象。
- `src/storage`: SecureStore 等本地存储封装。
- `src/types`: 面试、报告、学习等核心类型。

## BYOK

MVP 不自建模型服务，不托管用户请求，不垫付模型费用。用户配置自己的 API Key，App 直接调用对应模型接口。

API Key 必须使用 `expo-secure-store` 保存，不能写入日志、AsyncStorage 或普通文件。

## Provider Adapter

模型调用通过 `ModelProvider` 抽象隔离：

```ts
interface ModelProvider {
  chat(input: ChatRequest): Promise<ChatResponse>;
  testConnection(): Promise<boolean>;
}
```

后续可实现 OpenAI-compatible、Qwen、GLM、Kimi 等 provider。页面和业务流程只依赖抽象，不直接依赖具体供应商。

## Feature-first

后续业务建议按功能域组织：

- model-config
- resume-diagnosis
- interview
- reports
- learning
- history
- weakness-tracking

共享组件仍放在 `src/components`，跨功能类型和 schema 放在 `src/types` 或后续 `packages`。

## 本地优先

MVP 优先本地保存配置和业务记录。API Key 使用 SecureStore，普通业务数据后续可使用 SQLite 或 MMKV。

本地优先的好处：

- 无需账号即可开始。
- 降低服务端成本和隐私风险。
- 离线查看历史记录更自然。

## 结构化 AI 输出

所有 AI 任务应优先输出结构化 JSON，并用 Zod 或 JSON Schema 校验。校验失败时重试一次；仍失败则 fallback 到纯文本展示并标记 `isStructured: false`。

关键任务包括：

- `resume_diagnosis`
- `interview_plan`
- `interview_question`
- `answer_review`
- `question_summary`
- `final_report_evidence`
- `final_report_generation`
- `learning_profile`
- `study_chat`
- `interview_comparison`
- `weakness_tracking`

## 上线前待补

- EAS Build / Submit 配置。
- 正式 iOS bundle id。
- 正式 Android package name。
- App icon。
- Splash screen。
- 隐私政策。
- App Store Privacy Nutrition Labels。
- Google Play Data Safety。
- 审核 Demo 模式。
- 麦克风、文件、图片权限文案。

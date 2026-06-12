# AI 面试教练 App 需求文档

版本：v0.4

## 1. 产品概述

AI 面试教练 App 是一款基于 React Native 的移动端应用，面向正在准备求职、转岗、晋升或专项能力提升的用户。用户可以通过上传简历、粘贴岗位 JD、输入个人背景描述或选择专项方向，进入模拟面试流程。

产品采用无自建服务端的 BYOK 模式，用户自行配置模型 API Key。App 负责本地配置、面试流程编排、上下文压缩、报告生成、学习模式和历史追踪。

核心闭环：

```text
简历诊断 / JD 输入 / 专项选择
→ 面试设置
→ 模拟面试
→ 每轮点评 + 追问 + 参考回答结构
→ 评估报告
→ 学习模式
→ 弱点追踪
→ 再次面试 / 对比复盘
```

## 2. 产品目标

- 帮助用户在面试前发现简历和表达问题。
- 模拟真实面试中的连续追问，而非简单题库问答。
- 给出结构化点评，让用户知道问题出在哪里。
- 生成有证据锚点的评估报告。
- 基于报告进入学习模式，针对短板继续训练。
- 通过历史记录、弱点追踪和对比报告形成长期留存。

## 3. 目标用户

- 应届生、实习生、校招用户。
- 社招候选人。
- 转岗或转行用户。
- 准备技术面、HR 面、英文面的人。
- 希望优化简历项目表达的人。
- 想反复练习项目追问和专项问题的人。

## 4. 核心概念

### 4.1 BYOK

BYOK 是 Bring Your Own Key，表示用户自带 API Key。

App 不提供统一模型服务，不托管用户请求，不垫付模型费用。用户在 App 中配置 OpenAI、Qwen、GLM、Kimi 等模型供应商的 API Key，App 直接调用对应模型接口。

### 4.2 面试轮次

用户设置的轮数不是简单的一问一答次数。

一轮代表一个相对独立的面试主题或能力点，例如：

- 项目经历深挖
- 技术原理
- 性能优化
- 团队协作
- 异常处理
- 岗位 JD 匹配
- HR 动机问题
- 英文表达

如果用户设置 5 轮面试，含义是最多进行 5 个主题。每一轮内部可以有多次提问，包括主问题和追问。

### 4.3 每轮最大提问次数

为了避免 AI 无限追问，每轮需要设置最大提问次数。

默认建议：

- 普通面试：每轮最多 3 次提问，即 1 个主问题 + 最多 2 次追问。
- 压力面：每轮最多 4 次提问。
- HR 面：每轮最多 2 次提问。
- 用户可在高级设置中调整。

## 5. 用户流程

### 5.1 首次使用

首次打开 App 时，用户可以先浏览首页和功能入口，但开始真实 AI 功能前必须完成模型配置。

无 API Key 时的行为：

- 点击“开始面试”：跳转到模型配置页，并提示“请先配置模型 API Key”。
- 点击“简历诊断”：跳转到模型配置页，并提示“诊断需要可用模型”。
- 点击“历史记录”：允许进入，若无记录展示空状态。
- 点击“学习模式”：若无报告或学习档案，展示空状态。

模型配置完成后，用户可进入：

- 简历诊断
- JD 面试
- 专项面试
- 历史报告

### 5.2 主流程

```text
打开 App
→ 检查是否存在可用模型配置
→ 选择简历诊断 / JD 面试 / 专项面试
→ 配置面试参数
→ 生成 interview_plan
→ 进入聊天面试
→ 完成评估报告
→ 选择是否进入学习模式
```

## 6. 功能范围

### 6.1 模型配置

用户可以配置自己的模型服务。

支持供应商：

- GPT / OpenAI-compatible
- Qwen
- GLM
- Kimi

功能要求：

- 选择模型供应商。
- 输入 API Key。
- 输入 Base URL，可选。
- 选择或填写模型名。
- 测试连接。
- 保存当前默认模型。
- 支持切换模型。

存储要求：

- API Key 使用系统安全存储。
- 普通模型偏好可以存在本地数据库。

### 6.2 简历诊断模式

简历诊断独立于面试流程，是用户首次使用的强入口。

用户输入方式：

- 粘贴简历文本。
- 上传 PDF。
- 上传图片。
- 输入个人经历描述。

MVP 优先级：

- 优先支持粘贴文本。
- 图片和 PDF 可以先作为文件输入能力保留，深度解析后置。

AI 诊断内容：

- 项目描述是否太空。
- 是否缺少量化数据。
- 是否缺少个人职责。
- 是否缺少技术难点。
- 是否缺少业务背景。
- 是否缺少结果产出。
- 措辞是否不够有力。
- 是否匹配目标岗位。

输出结构：

```ts
type ResumeDiagnosis = {
  id: string;
  createdAt: number;
  overallScore: number;
  summary: string;
  issues: {
    section: string;
    originalText: string;
    problem: string;
    suggestion: string;
    improvedExample: string;
    severity: "low" | "medium" | "high";
  }[];
  missingSignals: string[];
  recommendedInterviewFocus: string[];
};
```

诊断结果可进入：

- 根据简历开始面试。
- 根据短板开始专项面试。
- 进入简历优化建议页。
- 进入学习模式。

### 6.3 简历优化建议

简历优化建议可以从简历诊断结果进入。

页面能力：

- 展示原文问题。
- 展示修改理由。
- 展示优化示例。
- 支持复制优化后的表达。
- 支持将优化后的内容作为面试背景。

MVP 可以先做成独立页面；如果开发节奏紧，也可内嵌在简历诊断结果页中。

### 6.4 面试入口

用户可通过以下入口开始面试：

- 从简历诊断结果进入。
- 粘贴岗位 JD。
- 上传或粘贴简历。
- 输入个人背景描述。
- 选择专项方向。

专项方向：

- 前端基础
- React
- React Native
- TypeScript
- 项目经历
- 算法
- 系统设计
- HR 面
- 英文面试
- 自定义专项

### 6.5 面试设置

用户进入面试前可配置：

- 面试轮数：3 / 5 / 8 / 10
- 每轮最大提问次数：2 / 3 / 4
- 难度：初级 / 中级 / 高级
- 面试风格：温和 / 常规 / 压力面
- 面试语言：中文 / 英文
- 面试目标：校招 / 社招 / 转岗 / 晋升 / 自定义
- 面试官类型

```ts
type InterviewSettings = {
  roundLimit: number;
  maxQuestionsPerRound: number;
  difficulty: "junior" | "middle" | "senior";
  style: "gentle" | "normal" | "pressure";
  language: "zh" | "en";
  interviewerType:
    | "tech_lead"
    | "hr"
    | "cross_dept"
    | "bigtech_round1"
    | "bigtech_final"
    | "project_lead";
  goal: "campus" | "social" | "transfer" | "promotion" | string;
};
```

面试官类型：

- 技术负责人
- HR
- 跨部门主管
- 大厂一面面试官
- 大厂终面面试官
- 项目负责人

不同面试官侧重点：

- 技术负责人：技术深度、架构取舍、故障处理。
- HR：动机、稳定性、沟通、薪资期望。
- 跨部门主管：协作、业务理解、推动能力。
- 项目负责人：项目真实性、职责边界、结果交付。
- 大厂一面：基础、项目细节、编码思路。
- 大厂终面：影响力、复杂问题处理、成长潜力。

### 6.6 面试规划

面试开始前，AI 根据用户背景和面试设置生成一份内部规划。该规划不直接暴露给用户，避免产生押题感。

触发时机：

- 用户点击“开始面试”。
- 模型配置可用。
- 面试设置已完成。

输入：

- 简历摘要。
- JD 摘要。
- 专项方向。
- 面试设置。
- 简历诊断结果，可选。

输出结构：

```ts
type InterviewPlan = {
  sessionId: string;
  createdAt: number;
  plannedRounds: {
    roundIndex: number;
    theme: string;
    focus: string[];
    interviewerAngle: string;
    expectedSignals: string[];
  }[];
};
```

使用方式：

- 每轮提问时注入当前 `theme` 和 `focus`。
- 后续轮次可根据用户表现微调，但不能超过用户设置的轮数。
- 报告中可用规划主题还原面试结构。

### 6.7 聊天面试

聊天面试页是核心体验。

基础规则：

- AI 每次只问一个问题。
- 用户回答后，AI 才能继续。
- 每轮可以有主问题和多次追问。
- 每轮提问次数不能超过上限。
- 达到轮数上限后结束面试。
- 用户可手动结束面试。

每轮流程：

```text
进入当前轮主题
→ AI 提出主问题
→ 用户回答
→ AI 点评
→ AI 判断是否追问
→ 未达到每轮提问上限且仍有追问价值，则继续追问
→ 否则结束本轮
→ 进入下一轮主题
```

聊天页能力：

- 文本输入。
- 语音转文字输入。
- 当前轮数展示。
- 当前轮内提问次数展示。
- 当前面试主题展示。
- 结束面试。
- 重新生成当前问题。
- 请求失败后重试。

### 6.8 每轮点评

用户每次回答后，AI 需要返回结构化点评。前端按模块渲染，避免纯文本堆叠。

点评内容：

- 回答亮点。
- 存在问题。
- 改进方向。
- 参考回答结构。
- 是否继续追问。
- 当前能力评分。

结构：

```ts
type RoundReview = {
  highlights: string[];
  problems: string[];
  betterDirection: string;
  referenceAnswerStructure: {
    framework: "STAR" | "总分总" | "现象-分析-方案" | "背景-挑战-行动-结果" | "原理-场景-权衡";
    outline: string[];
    exampleSnippet?: string;
  };
  followUpDecision: {
    shouldFollowUp: boolean;
    reason: string;
    followUpQuestion?: string;
    shouldEndRound: boolean;
    nextRoundFocus?: string;
  };
  score: {
    clarity: number;
    depth: number;
    relevance: number;
    authenticity: number;
  };
};
```

### 6.9 追问策略

触发追问的条件：

- 回答太泛。
- 没有说明个人职责。
- 没有数据或结果。
- 技术方案缺少取舍。
- 项目背景不清楚。
- 遇到问题后没有分析过程。
- 关键概念只会背定义。
- 回答与岗位 JD 关系不明显。
- 用户回避了问题核心。

结束本轮的条件：

- 已达到当前轮最大提问次数。
- 用户回答已经足够充分。
- 当前主题继续追问收益不高。
- 已暴露出明确短板，适合放入报告或学习模式。
- 用户连续偏离主题。
- 当前面试时间或轮次需要推进。

### 6.10 标准答案参考结构

每次点评后附上“满分回答结构”。

定位：

- 给用户参考框架。
- 帮用户理解好回答的组织方式。
- 不鼓励背固定答案。

常见结构：

- STAR：Situation / Task / Action / Result
- 总分总：结论 / 分点解释 / 回到结论
- 现象-分析-方案
- 背景-挑战-行动-结果
- 原理-场景-权衡

### 6.11 上下文压缩

面试过程中不持续携带完整聊天记录，避免成本过高和上下文过长。

每次问答结束后生成一条轮内摘要：

```ts
type QuestionSummary = {
  roundIndex: number;
  questionIndexInRound: number;
  topic: string;
  question: string;
  answerSummary: string;
  reviewSummary: string;
  exposedWeaknesses: string[];
  scoreSnapshot: Record<string, number>;
};
```

后续提问只携带：

- 简历摘要。
- JD 摘要。
- 目标岗位。
- 面试官类型。
- 已问问题列表。
- 已暴露弱点。
- 问答摘要。
- 当前轮次状态。

完整原文保存在本地，用于详情页和报告生成。

### 6.12 最终评估报告

面试结束后生成评估报告。

报告生成建议分两步：

第一步：评分与证据提取。

```ts
type ReportEvidence = {
  reportId: string;
  interviewId: string;
  createdAt: number;
  dimensions: {
    dimension: string;
    score: number;
    evidence: {
      roundIndex: number;
      questionIndexInRound: number;
      topic: string;
      question: string;
      userBehavior: string;
      problem: string;
    }[];
  }[];
};
```

第二步：生成报告和学习计划。

```ts
type FinalReport = {
  id: string;
  interviewId: string;
  createdAt: number;
  overallScore: number;
  dimensionScores: Record<string, number>;
  strengths: string[];
  weakPoints: string[];
  highRiskQuestions: string[];
  nextPracticeSuggestions: string[];
  recommendedLearningPath: string[];
  stats: {
    roundCount: number;
    questionCount: number;
    followUpCount: number;
    averageQuestionsPerRound: number;
    endReason: string;
  };
};
```

报告内容：

- 总体评分。
- 各维度评分。
- 每个评分的证据锚点。
- 优势总结。
- 主要短板。
- 高频失分点。
- 高风险面试问题。
- 下一次练习建议。
- 推荐学习路径。

评分维度：

- 技术深度
- 表达清晰度
- 项目真实性
- 问题分析能力
- 岗位匹配度
- 结构化回答能力
- 抗追问能力

示例：

```text
本场面试共 5 轮，提出 13 个问题，其中 8 个为追问。
抗追问能力：3/5
证据：第 3 轮第 2 问追问项目规模时，回答缺少并发量、团队规模和个人职责边界。
```

### 6.13 学习模式

报告生成后，询问用户是否进入学习模式。

入口文案：

```text
你的报告已生成，要根据短板进入学习模式吗？
```

学习模式不携带完整面试上下文，而是使用压缩后的学习档案。

```ts
type LearningProfile = {
  id: string;
  interviewId: string;
  reportId: string;
  createdAt: number;
  status: "not_started" | "in_progress" | "completed";
  targetRole: string;
  interviewSummary: string;
  strengths: string[];
  weakPoints: string[];
  repeatedWeaknesses: string[];
  score: Record<string, number>;
  recommendedTopics: {
    id: string;
    title: string;
    status: "pending" | "in_progress" | "completed";
  }[];
  nextPracticeGoal: string;
};
```

学习模式类型：

- 短板补强。
- 项目深挖训练。
- STAR 表达训练。
- 高频题训练。
- 简历表达优化。
- 针对性再面试。

完成状态：

- 用户进入学习模式后，状态为 `in_progress`。
- 当前推荐主题全部完成后，状态为 `completed`。
- 历史详情页展示“未学习 / 学习中 / 已完成学习”。
- 已完成学习的弱点在弱点追踪中降权，但不直接清除。

交互规则：

- 每次只讲一个知识点。
- 每次只给一个练习。
- 用户回答后再点评。
- 可以切回面试模式。
- 可以根据当前学习结果更新弱点追踪。

### 6.14 面试复盘对比

同一方向完成两次或多次面试后，生成对比报告。

对比内容：

- 总分变化。
- 各维度分数变化。
- 已改善的问题。
- 反复出现的问题。
- 新暴露的问题。
- 下一步训练建议。

结构：

```ts
type InterviewComparison = {
  id: string;
  createdAt: number;
  previousInterviewId: string;
  currentInterviewId: string;
  scoreDiff: Record<string, number>;
  improvedAreas: string[];
  repeatedProblems: string[];
  newProblems: string[];
  nextFocus: string[];
};
```

### 6.15 弱点专项追踪

跨多次面试统计用户反复失分的问题。

示例：

- “说不清项目背景”出现 3 次。
- “技术方案缺少权衡”出现 2 次。
- “回答没有数据结果”出现 4 次。

首页提醒：

```text
你有一个持续弱点待攻克：项目结果表达不足
```

可进入：

- 弱点详情。
- 相关历史回答。
- 专项学习。
- 针对性面试。

### 6.16 历史记录

本地保存：

- 简历诊断记录。
- 面试原始记录。
- 面试规划。
- 问答摘要。
- 最终报告。
- 学习档案。
- 学习完成状态。
- 弱点追踪数据。
- 用户模型配置。

历史页展示：

- 面试方向。
- 面试官类型。
- 日期。
- 总评分。
- 主题轮数。
- 总问题数。
- 主要短板。
- 是否进入学习模式。
- 学习完成状态。

## 7. 错误处理与降级

### 7.1 语音输入降级

系统语音识别不可用时，处理规则：

- 用户拒绝麦克风权限：提示开启权限，并保留文本输入。
- 系统不支持语音识别：隐藏或禁用语音按钮。
- 语音识别失败：提示重试，保留已识别文本。
- 网络不可用：提示网络状态，并切回文本输入。

语音输入只是增强能力，不能阻断面试主流程。

### 7.2 模型调用失败

面试中的 AI 请求失败后，用户可重试当前步骤。

重试规则：

- 重试当前 AI 调用，不重新生成已有问题。
- 如果失败发生在“生成问题”阶段，重试同一个轮次和主题。
- 如果失败发生在“点评回答”阶段，保留用户回答，只重试点评。
- 如果失败发生在“生成报告”阶段，保留面试记录，只重试报告生成。
- 连续失败时展示错误原因和模型配置入口。

### 7.3 AI 输出校验

所有结构化 AI 输出都需要校验。

机制：

- 使用 JSON Schema 或 Zod 校验输出。
- 校验失败时自动重试一次，并加入“请严格按 JSON 格式输出”的纠错指令。
- 两次失败后 fallback 到纯文本展示。
- fallback 结果仍然保存，但标记 `isStructured: false`。
- 结构化失败不能导致 App 崩溃。

## 8. 页面结构

- 首页
- 面试工作台页
- 首次使用引导页
- 模型配置页
- 简历诊断页
- 简历诊断结果页
- 简历优化建议页
- 面试入口页
- 面试设置页
- 专项选择页
- 聊天面试页
- 报告页
- 学习模式页
- 历史记录页
- 历史详情页
- 对比报告页
- 弱点追踪页

## 9. AI 任务设计

任务类型：

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

### 9.1 interview_plan

`interview_plan` 在面试开始前触发，用于规划整场面试的主题顺序和每轮关注点。

它解决的问题：

- 避免每轮随机出题。
- 避免重复问同一类问题。
- 让 5 轮面试真的覆盖 5 个能力点。
- 让后续报告能按主题还原面试结构。

该规划不直接展示给用户，只作为后续问题生成的内部上下文。

## 10. Prompt 工程要求

Prompt 是最高优先级能力层。

### 10.1 问题生成 Prompt

必须注入：

- 简历摘要。
- 目标岗位。
- JD 关键词。
- 面试官类型。
- 难度。
- 当前面试主题。
- 当前轮内提问次数。
- 每轮最大提问次数。
- 已问过的问题。
- 已暴露的弱点。
- 当前轮目标。
- `interview_plan` 中当前轮的 `theme` 和 `focus`。

目标：

- 避免教科书题。
- 围绕用户真实背景提问。
- 避免重复问题。
- 每次只问一个问题。
- 根据轮次推进不同能力维度。

### 10.2 点评 Prompt

要求 AI 输出 JSON：

- 亮点。
- 问题。
- 改进方向。
- 参考回答结构。
- 追问决策。
- 分数。

### 10.3 追问 Prompt

必须明确：

- 什么时候追问。
- 什么时候结束本轮。
- 什么时候进入下一主题。
- 当前轮提问次数是否达到上限。

### 10.4 报告 Prompt

报告分步生成：

- 评分与证据。
- 建议与学习计划。

每个评分必须绑定证据，避免空泛评价。

## 11. 技术方案建议

移动端：

- Expo React Native
- TypeScript
- Expo Router

本地存储：

- API Key：expo-secure-store
- 普通业务数据：SQLite 或 MMKV

状态管理：

- Zustand

文件能力：

- 文件选择：expo-document-picker
- 图片选择：expo-image-picker

语音能力：

- 优先使用系统语音识别。
- 录音转写可作为后续增强。

模型调用：

- fetch
- Provider Adapter
- JSON Schema / Zod 校验

## 12. AI Provider 抽象

```ts
interface ModelProvider {
  chat(input: ChatRequest): Promise<ChatResponse>;
  testConnection(): Promise<boolean>;
}
```

Provider：

- OpenAIProvider
- QwenProvider
- GLMProvider
- KimiProvider

## 13. MVP 优先级

### 13.1 必做

- 模型配置。
- 首次使用引导。
- 简历诊断。
- 简历优化建议。
- 面试入口。
- 面试设置。
- 面试官类型。
- 面试规划。
- 聊天面试。
- 每轮多次追问。
- 每轮最大提问次数限制。
- 每次回答后的结构化点评。
- 参考回答结构。
- 上下文压缩。
- AI 输出校验。
- 失败重试。
- 最终报告。
- 学习模式。
- 学习完成状态。
- 本地历史记录。

### 13.2 P1

- 面试复盘对比。
- 弱点专项追踪。
- 简历优化联动增强。
- 英文面试专项。
- 更多面试官人设。

### 13.3 Later

- 账号系统。
- 云同步。
- 订阅付费。
- 服务端模型代理。
- PDF 报告导出。
- 复杂 OCR。
- 上架隐私政策。
- Data Safety。
- 审核 Demo 模式。

## 14. 成功标准

MVP 完成后，用户应能：

- 配置自己的模型 API Key。
- 无 API Key 时被明确引导到模型配置。
- 粘贴简历并获得诊断。
- 查看简历优化建议。
- 根据简历、JD 或专项开始面试。
- 设置面试轮数和每轮最大提问次数。
- 体验真实的主问题 + 追问流程。
- 每次回答后获得结构化点评。
- 看到参考回答结构。
- 请求失败时能重试当前步骤。
- 面试结束后获得带证据的评估报告。
- 根据报告进入学习模式。
- 查看学习完成状态。
- 在历史记录中查看面试、报告和学习结果。

P1 完成后，用户应能：

- 对比同方向多次面试表现。
- 看到弱点趋势提醒。
- 针对反复出现的问题进入专项训练。

## 15. 非目标

MVP 阶段不解决：

- 多用户账号体系。
- 云端同步。
- 统一模型代理。
- 商业化订阅。
- App Store / Google Play 上架合规细节。
- 企业后台。
- 复杂简历排版编辑器。

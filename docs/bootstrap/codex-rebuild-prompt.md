# Codex 重建项目提示词

用途：后续如果不提交当前代码，也可以把这份 Markdown 的内容复制给 Codex，让它在一个空目录中生成相似的项目结构、技术栈和文档内容，继续开发本产品。

## 使用方式

在新的空目录中打开 Codex，粘贴下面的提示词：

```markdown
你是一个资深移动端工程师。请帮我从零创建一个面向真实上线的 React Native App 项目，产品是 AI 面试教练 App。

请用中文回复，言简意赅，必要时使用少量 Emoji。不要提交 Git，除非我明确要求。

## 目标

创建一个可长期维护、后续可真实上架的 Expo React Native 项目骨架，并生成配套文档。这个项目不是一次性 Demo。

产品核心闭环：

简历诊断 / JD 输入 / 专项选择
→ 模拟面试
→ 每轮点评 + 追问
→ 评估报告
→ 学习模式
→ 弱点追踪

## 技术栈

使用：

- Monorepo：pnpm workspace
- Mobile：Expo React Native
- Language：TypeScript
- Router：Expo Router
- State：Zustand
- Runtime validation：Zod
- API Key storage：expo-secure-store
- UI：系统跟随浅色 / 深色主题

要求：

- Node 使用 20 LTS。
- 优先使用当前 Expo 稳定版本；如果无法联网安装模板，可以手工 scaffold。
- 先不 eject，减少原生维护成本。
- 先不自建服务端。
- MVP 使用 BYOK：用户自带模型 API Key。

## 目录结构

请生成这个结构：

```text
.
├── README.md
├── AGENTS.md
├── CLAUDE.md
├── package.json
├── pnpm-workspace.yaml
├── .nvmrc
├── .gitignore
├── apps/
│   └── mobile/
│       ├── app.json
│       ├── package.json
│       ├── babel.config.js
│       ├── tsconfig.json
│       ├── expo-env.d.ts
│       ├── .env.example
│       ├── eslint.config.js
│       ├── app/
│       │   ├── _layout.tsx
│       │   └── (tabs)/
│       │       ├── _layout.tsx
│       │       ├── index.tsx
│       │       ├── interview.tsx
│       │       ├── history.tsx
│       │       └── settings.tsx
│       └── src/
│           ├── components/
│           │   ├── AppButton.tsx
│           │   ├── AppCard.tsx
│           │   └── Screen.tsx
│           ├── providers/
│           │   └── modelProvider.ts
│           ├── storage/
│           │   └── secureKeys.ts
│           ├── theme/
│           │   ├── AppThemeProvider.tsx
│           │   ├── tokens.ts
│           │   └── useTheme.ts
│           └── types/
│               └── interview.ts
├── docs/
│   ├── README.md
│   ├── product/
│   │   └── requirements.md
│   ├── design/
│   │   └── design-plan.md
│   ├── architecture/
│   │   └── overview.md
│   ├── prototypes/
│   │   └── index.html
│   └── bootstrap/
│       └── codex-rebuild-prompt.md
└── packages/
```

## 根目录配置

根目录 `package.json` 使用这些脚本：

```json
{
  "name": "ai-interview-coach",
  "private": true,
  "version": "0.1.0",
  "packageManager": "pnpm@10.32.1",
  "scripts": {
    "mobile:start": "pnpm --dir apps/mobile start",
    "mobile:android": "pnpm --dir apps/mobile android",
    "mobile:ios": "pnpm --dir apps/mobile ios",
    "mobile:web": "pnpm --dir apps/mobile web",
    "mobile:lint": "pnpm --dir apps/mobile lint",
    "mobile:typecheck": "pnpm --dir apps/mobile typecheck"
  }
}
```

`pnpm-workspace.yaml`：

```yaml
packages:
  - apps/*
  - packages/*
```

`.nvmrc`：

```text
20.19.0
```

`.gitignore` 需要忽略：

- `node_modules/`
- `.expo/`
- `dist/`
- `web-build/`
- `android/`
- `ios/`
- `.env`
- `.env.*`
- 原生构建产物：`*.apk`、`*.aab`、`*.ipa`、`*.xcarchive`

保留 `.env.example`。

## Mobile package

`apps/mobile/package.json`：

```json
{
  "name": "@ai-interview-coach/mobile",
  "version": "0.1.0",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@expo/vector-icons": "^14.1.0",
    "@react-native-async-storage/async-storage": "2.1.2",
    "expo": "~53.0.0",
    "expo-constants": "~17.1.0",
    "expo-document-picker": "~13.1.0",
    "expo-file-system": "~18.1.0",
    "expo-font": "~13.3.0",
    "expo-haptics": "~14.1.0",
    "expo-image-picker": "~16.1.0",
    "expo-linking": "~7.1.0",
    "expo-router": "~5.1.0",
    "expo-secure-store": "~14.2.0",
    "expo-splash-screen": "~0.30.0",
    "expo-status-bar": "~2.2.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "react-native": "0.79.5",
    "react-native-safe-area-context": "5.4.0",
    "react-native-screens": "~4.11.0",
    "react-native-web": "^0.20.0",
    "zod": "^3.25.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.25.0",
    "@types/react": "~19.0.10",
    "eslint": "^9.25.0",
    "eslint-config-expo": "~9.2.0",
    "typescript": "~5.8.3"
  }
}
```

如果 Expo 最新稳定版本已变化，可以优先使用 `create-expo-app` 生成最新模板，再保持本提示词中的目录和架构约束。

## app.json

要求：

- `name`: `AI Interview Coach`
- `slug`: `ai-interview-coach`
- `scheme`: `interviewcoach`
- `userInterfaceStyle`: `automatic`
- `newArchEnabled`: `true`
- iOS `bundleIdentifier` 先用 `com.example.aiinterviewcoach`
- Android `package` 先用 `com.example.aiinterviewcoach`
- plugins 包含：
  - `expo-router`
  - `expo-secure-store`
  - `expo-document-picker`
  - `expo-image-picker`
- experiments 开启 `typedRoutes`

提醒：后续真实上线前需要替换正式 bundle id 和 Android package。

## App 初始页面

创建 4 个底部 Tab：

- 首页
- 面试
- 历史
- 我的

页面定位：

- 首页：主行动是“开始面试”，次行动是“简历诊断”，展示持续弱点和最近报告。
- 面试：训练工作台，包含简历面试、JD 面试、React Native 专项、恢复进行中面试。
- 历史：先展示空状态，说明后续会展示报告、弱点和学习状态。
- 我的：展示模型配置入口说明。

聊天面试不是底部 Tab，后续做成沉浸式全屏流程。

## 主题系统

创建：

- `src/theme/tokens.ts`
- `src/theme/AppThemeProvider.tsx`
- `src/theme/useTheme.ts`

要求：

- 支持系统跟随浅色 / 深色。
- 深色背景使用 `#0D1117`。
- 主强调色深色为 `#4F8EF7`，浅色为 `#2563EB`。
- 语义色包含 success、warning、danger、info。
- 组件从 `useTheme()` 读取颜色和 typography，不要在页面中散落硬编码颜色。

深色 token：

```ts
background: "#0D1117"
surface: "#161B22"
surfaceElevated: "#1F2630"
border: "#30363D"
textPrimary: "#F0F6FC"
textSecondary: "#8B949E"
textMuted: "#6E7681"
accent: "#4F8EF7"
success: "#34C759"
warning: "#F5A623"
danger: "#FF5A5F"
```

浅色 token：

```ts
background: "#F7F9FC"
surface: "#FFFFFF"
surfaceElevated: "#F1F5FA"
border: "#DDE3EA"
textPrimary: "#101828"
textSecondary: "#475467"
textMuted: "#98A2B3"
accent: "#2563EB"
success: "#12B76A"
warning: "#F79009"
danger: "#F04438"
```

## 基础组件

创建：

- `Screen`：负责 SafeArea 和页面背景。
- `AppCard`：通用卡片，支持 `default / info / success / warning / danger` tone。
- `AppButton`：支持 `primary / secondary`。

## 核心类型

在 `src/types/interview.ts` 定义：

```ts
export type InterviewerType =
  | "tech_lead"
  | "hr"
  | "cross_dept"
  | "bigtech_round1"
  | "bigtech_final"
  | "project_lead";

export type InterviewSettings = {
  roundLimit: number;
  maxQuestionsPerRound: number;
  difficulty: "junior" | "middle" | "senior";
  style: "gentle" | "normal" | "pressure";
  language: "zh" | "en";
  interviewerType: InterviewerType;
  goal: "campus" | "social" | "transfer" | "promotion" | string;
};

export type InterviewPlan = {
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

export type LearningProfile = {
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

## Model Provider 抽象

在 `src/providers/modelProvider.ts` 定义：

```ts
export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatRequest = {
  messages: ChatMessage[];
  model: string;
  temperature?: number;
};

export type ChatResponse = {
  content: string;
  raw?: unknown;
};

export interface ModelProvider {
  chat(input: ChatRequest): Promise<ChatResponse>;
  testConnection(): Promise<boolean>;
}
```

## SecureStore

在 `src/storage/secureKeys.ts` 封装：

- `saveModelApiKey(provider, apiKey)`
- `getModelApiKey(provider)`
- `deleteModelApiKey(provider)`

要求只能使用 `expo-secure-store` 保存 API Key。

## 文档要求

创建 `docs/README.md`，说明：

```text
docs
├── product/       # 产品需求、PRD、用户流程
├── design/        # 设计规划、设计系统、交互说明
├── architecture/  # 技术架构、工程决策、上线说明
└── prototypes/    # 静态原型和可视化预览
```

创建 `docs/product/requirements.md`，内容包括：

- 产品概述
- 产品目标
- 目标用户
- BYOK 说明
- 面试轮次定义：轮 = 主题 / 能力点，不是一次问答
- 每轮最大提问次数
- 首次使用流程
- 模型配置
- 简历诊断模式
- 简历优化建议
- 面试入口
- 面试设置
- 面试规划 `interview_plan`
- 聊天面试
- 每轮点评
- 追问策略
- 标准答案参考结构
- 上下文压缩
- 最终评估报告
- 学习模式
- 面试复盘对比
- 弱点专项追踪
- 历史记录
- 错误处理与降级
- 页面结构
- AI 任务设计
- Prompt 工程要求
- 技术方案建议
- MVP / P1 / Later
- 成功标准
- 非目标

创建 `docs/design/design-plan.md`，内容包括：

- 设计定位：专业、有力量、但不冰冷
- 系统跟随浅色 / 深色主题
- 色彩系统
- 字体与排版
- 签名元素：AI 消息左侧亮靛蓝竖线
- 点评分区卡片
- 面试进度轨
- 信息架构：首页 / 面试 / 历史 / 我的
- 首页内容优先级：开始面试、简历诊断、进行中面试、弱点提醒、最近报告、专项入口、模型配置状态
- 模型配置页
- 简历诊断页
- 聊天面试页
- 每轮点评卡片
- 评估报告页
- 学习模式页
- 历史记录页
- 组件系统
- 动效原则
- 原型范围

创建 `docs/architecture/overview.md`，说明：

- 为什么选择 Expo React Native + TypeScript + Expo Router
- monorepo 结构
- mobile 目录职责
- BYOK
- Provider Adapter
- Feature-first
- 本地优先
- 结构化 AI 输出
- 上线前待补：EAS、bundle id、package name、icon、splash、隐私政策、Data Safety、审核 Demo

创建 `docs/prototypes/index.html`：

- 静态 HTML 原型即可。
- 展示 iPhone 深色和 Android 浅色。
- 覆盖首页、面试工作台、聊天面试、每轮点评、评估报告、学习模式。
- 体现 `#0D1117` 深色背景、AI 蓝色竖线、点评分区卡片。

## AGENTS.md

生成根目录 `AGENTS.md`，参考 AGENTS.md 社区最佳实践，包含：

- Project Overview
- Repository Layout
- Setup Commands
- Code Style
- Testing Instructions
- Product Constraints
- UI Guidelines
- Security Considerations
- Git And PR Instructions
- Agent Notes

重点规则：

- 中文回复，简洁直接。
- 修改前先读文档和现有代码。
- 使用 `rg` 搜索。
- 减少 Xcode Build。
- API Key 只能用 `expo-secure-store`。
- 不要把 API Key 写入日志、AsyncStorage 或普通文件。
- 提交信息使用中文。

生成 `CLAUDE.md`，内容只写：

```md
@AGENTS.md
```

## README

根目录 `README.md` 说明：

- 项目简介
- 快速开始
- 常用校验
- 目录结构
- 文档入口

## 验证

完成后运行：

```bash
pnpm install
pnpm mobile:typecheck
pnpm mobile:lint
```

如果安装依赖需要联网或 registry 配置异常，说明原因，不要擅自改全局 npm / pnpm 配置。

## 输出要求

完成后告诉我：

- 创建了哪些目录和文件
- 技术栈为什么这样选
- 哪些命令已验证通过
- 哪些事情需要后续真实上线前补齐
```

## 备注

这份提示词用于恢复“项目初始结构 + 文档体系 + 基础架构边界”，不要求恢复完整业务功能。后续开发建议继续按以下顺序推进：

1. 模型配置与 BYOK 存储
2. Provider Adapter
3. 简历诊断
4. 面试规划与聊天流程
5. 每轮点评与上下文压缩
6. 报告与学习模式
7. 历史记录与弱点追踪


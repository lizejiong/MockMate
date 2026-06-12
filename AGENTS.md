# AGENTS.md

## 项目概况

AI 面试教练 App，Expo React Native + TypeScript + Expo Router，pnpm workspace。当前阶段采用 BYOK，不自建服务端，API Key 由用户自带。

主要目录：

- `apps/mobile`: 移动端 App。
- `apps/mobile/app`: Expo Router 页面。
- `apps/mobile/src`: 组件、主题、Provider、存储和业务类型。
- `docs`: 产品、设计、架构和原型文档。
- `packages`: 后续共享包预留目录。

## 常用命令

```bash
pnpm install
pnpm mobile:start
pnpm mobile:typecheck
pnpm mobile:lint
pnpm mobile:test
```

## 开发规则

- 修改前先读相关文档和现有代码，搜索优先使用 `rg`。
- 实现功能时按可长期维护、可真实上线的质量标准设计；可以分阶段交付，但不要把“先做 MVP”当作降低架构、体验、错误处理或测试质量的理由。
- 避免临时凑合方案。若必须延期某项能力，要保留清晰边界、可替换接口和明确后续路径。
- TypeScript 类型应清晰表达业务边界，避免把业务流程、UI 和存储逻辑揉在一个文件里。
- 组件从 `useTheme()` 读取颜色和 typography，不要在页面中散落硬编码颜色。
- 关键逻辑和设计决策处必须写注释，重点解释“为什么这样做”。边界处理、性能考量、安全约束和平台差异必须说明清楚。
- 注释使用 JSDoc 风格：多行说明用 `/** ... */`，单行简短说明用 `/** 一行 */`。不要用 `//` 作为文档注释。

## 产品约束

- 当前阶段不做账号系统、云同步、订阅、统一模型代理或服务端。
- 聊天面试不是底部 Tab，后续做成沉浸式全屏流程。
- 一轮面试代表一个主题或能力点，不是一问一答次数。
- AI 输出需要结构化校验，失败不能导致 App 崩溃。

## 安全规则

- API Key 只能用 `expo-secure-store` 保存。
- 不要把 API Key 写入日志、AsyncStorage 或普通文件。
- `.env` 和 `.env.*` 必须忽略，`.env.example` 保留。
- 模型请求失败时展示可理解错误，不暴露敏感信息。

## 验证与 Git

- 常规校验运行 `pnpm mobile:typecheck`、`pnpm mobile:lint` 和 `pnpm mobile:test`。
- 触达原生构建前，优先用 Web / Expo Go 验证。
- 不要提交 Git，除非用户明确要求；如需提交，提交信息使用中文。

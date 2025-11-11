# 开发者指南

本指南面向在本地开发、调试和验证 CreepJS.org 的贡献者。

## 1. 前置要求

| 工具 | 版本/说明 |
|------|-----------|
| Node.js | 18.19+ (Cloudflare Workers 兼容) |
| pnpm | 8.x+（推荐 `corepack enable`） |
| Turborepo | 自带于 pnpm workspace，不需要全局安装 |
| Wrangler CLI | `npm i -g wrangler`，用于 Workers/KV |
| Git | 支持长路径与 LFS（如需 Demo 资源） |
| Optional | Miniflare、Playwright、Redis CLI（仅本地调试） |

```bash
# 快速检查
node -v
pnpm -v
wrangler --version
```

## 2. 仓库结构

```
creepjs/
├── apps/
│   ├── web/        # Next.js 15 App Router 站点
│   └── api/        # Cloudflare Workers + Hono API
├── packages/
│   ├── core/       # 指纹收集 & 哈希算法
│   └── sdk/        # 浏览器/Node SDK 封装
├── docs/           # 产品 & 技术文档
├── openspec/       # 规格与变更提案
└── package.json    # Workspace 清单
```

- `apps/web`: 落地页、Demo、Docs、Playground，使用 shadcn/ui 和 Tailwind。
- `apps/api`: Hono.js + KV，包含 `routes/`, `middleware/`, `utils/`。
- `packages/core`: Canvas/WebGL/Navigator 收集器与 MurmurHash 实现。
- `packages/sdk`: `getFingerprint` 高级封装（导出 ESM + UMD）。

## 3. 安装与脚本

```bash
pnpm install           # 安装所有 workspace 依赖
pnpm dev:web           # apps/web 本地开发（Next.js）
pnpm dev:api           # apps/api 使用 wrangler dev
turbo run build        # 构建全部项目
pnpm lint              # 运行 ESLint + TypeScript 检查
turbo run test         # 运行单元测试（Vitest/Jest）
turbo run test:e2e     # Playwright 端到端（需要浏览器）
```

> Linting 采用单一 `eslint.config.mjs`（Flat Config）+ Next 插件组合，`pnpm lint --filter <package>` 可在单个 workspace 中执行规则。Next.js 构建流程仍会运行 `next lint`，因此 `apps/web` 下的 `.eslintrc.json` 仅用于告知 Next 使用其插件，实际规则统一由根配置维护。

### 环境变量

复制模板文件并填写：

```bash
cp .env.example .env.local
```

关键变量：
- `NEXT_PUBLIC_API_BASE=https://api.creepjs.org`
- `CREEPJS_TOKEN_PRIVATE_KEY=`（仅本地模拟）
- `CREEPJS_KV_NAMESPACE=` （wrangler 输出）

Workers 端环境通过 `wrangler secret put` 管理。

## 4. 开发流程

1. **创建 OpenSpec 变更** → `openspec/changes/<id>/`，写好 proposal/tasks/spec。
2. **创建分支** → `git checkout -b docs/add-playground-guide`。
3. **实现与自测** → 依据 `tasks.md` 完成子任务。
4. **运行质量检查** → `pnpm lint && turbo run test`；如修改 API，还需 `wrangler dev` 验证。
5. **提交** → 使用 Conventional Commit (`docs: add sdk guide`) 并在描述中引用 change-id。
6. **PR & 回归** → 在 CI 中验证 lint/test/preview 均通过。

## 5. 测试策略

| 层级 | 位置 | 说明 |
|------|------|------|
| 单元测试 | `*.test.ts` | collectors、hash、Hono handlers、SDK utils |
| 集成测试 | `apps/api/tests`, `apps/web/tests` | Miniflare + Playwright 场景 |
| 可视测试 | Storybook/Chromatic（可选） | 组件回归 |

示例运行：
```bash
pnpm --filter @creepjs/core test
pnpm --filter apps/web test:e2e
pnpm --filter @creepjs/api test   # Cloudflare Workers (Vitest pool)
```

`apps/api/tests` 使用 Cloudflare Vitest pool + 内存 KV 模拟器，覆盖 `/v1/token`、`/v1/fingerprint` 的鉴权、限流和成功路径。添加新端点时务必同步扩展对应的测试 helper（`tests/utils.ts`）以保持行为可验证。

## 6. 调试与排障

### API
- `wrangler dev` 会自动加载 `.dev.vars`，如需自定义 KV 数据可使用 `wrangler kv:key put`。
- 通过 `wrangler tail` 观察生产日志。
- 常见错误
  - `KV namespace not bound` → 检查 `wrangler.toml`。
  - `401 INVALID_TOKEN` → 确认 `X-API-Token` 头。

### Web
- Next.js 使用边缘运行时，确保 API 代理指向 `api.creepjs.org`。
- Demo 需要 WebGL；若浏览器禁用，将 fallback 到 "WebGL unavailable" 提示。

### SDK
- `pnpm --filter @creepjs/sdk build --watch` 可实时输出 UMD/ESM。
- 通过 `pnpm --filter apps/web dev` 引入本地 SDK（pnpm workspace linking）。

## 7. 质量守则

- 模块上限 ~300 行；当 Demo/SDK 逻辑复杂时拆分 hooks/util。
- 不直接引入浏览器专有 API 于服务器组件；使用 `"use client"` 分离。
- 所有网络请求包裹在 `try/catch` 并打印结构化日志。
- SDK 公共 API 变更必须 bump minor/major 版本并更新 [SDK](./SDK.md)。
- 提交前运行 `openspec validate <change-id> --strict`。

## 8. 发布流程（概览）

1. 合并到 `main` → 触发 CI（lint/test/build）。
2. Cloudflare Pages 自动构建 `apps/web`。
3. Workers 通过 `wrangler deploy`（GitHub Action）发布。
4. SDK 发布：`pnpm changeset`, `pnpm publish -r`，并把构建产物同步到 `apps/web/public/sdk.js` 与 CDN。
5. 更新 `docs` & `CHANGELOG`，必要时运行 `openspec archive`。

## 9. 资源

- [ARCHITECTURE.md](./ARCHITECTURE.md) 获取系统图。
- [DEPLOYMENT.md](./DEPLOYMENT.md) 获取 Cloudflare 指令。
- [SECURITY.md](./SECURITY.md) 审查数据处理。
- Slack `#creepjs-dev` / 邮件 `dev@creepjs.org` 反馈阻塞。

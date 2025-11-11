# CreepJS.org - 浏览器指纹识别平台

> 基于 CreepJS 开源项目的轻量级浏览器指纹识别 SaaS 服务

[![CI Status](https://github.com/yourusername/creepjs/workflows/CI%20-%20Pre-merge%20Checks/badge.svg)](https://github.com/yourusername/creepjs/actions)
[![Deploy API](https://github.com/yourusername/creepjs/workflows/Deploy%20API%20to%20Cloudflare%20Workers/badge.svg)](https://github.com/yourusername/creepjs/actions)
[![Deploy Web](https://github.com/yourusername/creepjs/workflows/Deploy%20Web%20to%20Cloudflare%20Pages/badge.svg)](https://github.com/yourusername/creepjs/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.9.0-brightgreen)](https://nodejs.org)
[![pnpm Version](https://img.shields.io/badge/pnpm-%3E%3D9.0.0-blue)](https://pnpm.io)

**Live Demo:** [https://creepjs.org](https://creepjs.org) | **API:** [https://api.creepjs.org](https://api.creepjs.org) | **Docs:** [https://creepjs.org/docs](https://creepjs.org/docs)

## 项目概述

CreepJS.org 是一个**教育性、隐私优先**的浏览器指纹识别平台，旨在帮助开发者理解和使用浏览器指纹技术，同时提供简单易用的 API 服务。

### 核心价值主张

**"3分钟集成的浏览器指纹 API，开发者友好，隐私优先"**

### 产品定位

- **教育性展示** - 让用户直观理解浏览器指纹技术
- **轻量级 API** - 无需复杂配置，快速集成
- **隐私优先** - 透明、最小化数据收集、用户可控
- **开发者友好** - 清晰的文档、SDK、Playground

## 产品边界

### ✅ MVP 阶段做什么

1. **精美的演示网站**
   - Landing Page（产品介绍）
   - 在线演示（实时显示浏览器指纹）
   - 文档中心（快速开始、API 参考）
   - Playground（在线测试 API）

2. **简单的 API 服务**
   - `POST /v1/fingerprint` - 生成指纹 ID
   - `GET /v1/token` - 获取 API Token
   - Token 认证
   - 基础限流

3. **JavaScript SDK**
   - 一行代码集成
   - 自动收集指纹数据
   - TypeScript 支持

4. **基础文档**
   - API 文档
   - 集成教程
   - 代码示例

### ❌ MVP 阶段不做什么

- ❌ **用户登录系统** - 避免复杂的账号体系
- ❌ **历史数据存储** - 无状态 API，不保存指纹历史
- ❌ **复杂风险评分** - 需要大量数据训练，后期考虑
- ❌ **支付系统** - 前期免费验证需求
- ❌ **管理后台** - 避免复杂的 Dashboard

## 技术栈

### 全栈技术选型（Cloudflare 全家桶）

```
Frontend
├── Next.js 15 (App Router)
├── TypeScript
├── Tailwind CSS + shadcn/ui
└── 部署: Cloudflare Pages

Backend API
├── Hono.js (轻量级框架)
├── Cloudflare Workers (Edge Runtime)
├── Cloudflare KV (Token 存储 + 限流)
└── 响应时间 < 50ms

核心引擎
├── 基于 CreepJS (MIT License)
├── TypeScript 重构
├── 模块化设计
└── 精简版 (Canvas + WebGL + Navigator)

SDK
├── 原生 JavaScript
├── TypeScript
├── UMD 格式 (支持 CDN)
└── 体积 < 15KB (gzipped)
```

### 为什么选择 Cloudflare？

| 优势 | 说明 |
|------|------|
| **零成本启动** | Workers 免费 100K 请求/天，Pages 无限带宽 |
| **全球低延迟** | 边缘节点覆盖全球，响应 < 50ms |
| **无需服务器** | Serverless 架构，无需运维 |
| **KV 存储** | 免费 1GB 存储 + 100K 读取/天 |
| **易于扩展** | 付费后可轻松扩展到百万级请求 |

## 项目结构

```
creepjs/
├── apps/
│   ├── web/                      # Next.js 展示网站
│   │   ├── app/
│   │   │   ├── page.tsx          # 首页
│   │   │   ├── demo/             # 在线演示
│   │   │   │   └── page.tsx
│   │   │   ├── docs/             # 文档中心
│   │   │   │   └── page.tsx
│   │   │   └── playground/       # API Playground
│   │   │       └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui 组件
│   │   │   ├── FingerprintDemo.tsx
│   │   │   ├── CodeBlock.tsx
│   │   │   └── ApiPlayground.tsx
│   │   └── public/
│   │       └── sdk.js            # 编译后的 SDK
│   │
│   └── api/                      # Cloudflare Workers API
│       ├── src/
│       │   ├── index.ts          # 主入口
│       │   ├── routes/
│       │   │   ├── fingerprint.ts
│       │   │   └── token.ts
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   └── ratelimit.ts
│       │   └── utils/
│       │       └── kv.ts
│       └── wrangler.toml         # Cloudflare 配置
│
├── packages/
│   ├── core/                     # 核心指纹引擎
│   │   ├── src/
│   │   │   ├── collectors/
│   │   │   │   ├── canvas.ts
│   │   │   │   ├── webgl.ts
│   │   │   │   └── navigator.ts
│   │   │   ├── hash.ts           # MurmurHash3
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── sdk/                      # JavaScript SDK
│       ├── src/
│       │   └── index.ts
│       ├── package.json
│       └── rollup.config.js      # UMD 构建配置
│
├── docs/                         # 项目文档
│   ├── ARCHITECTURE.md           # 技术架构
│   ├── API.md                    # API 文档
│   ├── PRD.md                    # 产品需求
│   ├── ROADMAP.md                # 开发计划
│   └── DEPLOYMENT.md             # 部署指南
│
├── package.json                  # Monorepo 配置
├── turbo.json                    # Turborepo
├── .env.example                  # 环境变量示例
└── README.md                     # 本文件
```

## 开发计划

### Phase 1: MVP (Week 1-6)

**目标**: 发布可用的最小化产品

| 周次 | 任务 | 交付物 |
|------|------|--------|
| Week 1 | 项目初始化 | Monorepo 结构、基础配置 |
| Week 2 | 核心引擎开发 | 指纹收集和哈希算法 |
| Week 3 | API 服务开发 | Workers API + KV 集成 |
| Week 4 | 前端网站开发 | 4个核心页面 |
| Week 5 | SDK 和文档 | JS SDK + 完整文档 |
| Week 6 | 优化和发布 | 性能优化、SEO、发布 |

### Phase 2: 产品化 (Month 3-6)

- 根据用户反馈迭代
- 添加付费计划（可选）
- 增加高级功能
- 扩展文档和示例

详见 [ROADMAP.md](./docs/ROADMAP.md)

## 成本估算

### MVP 阶段（前 6 个月）

| 项目 | 免费额度 | 超出成本 | 实际成本 |
|------|----------|----------|----------|
| Cloudflare Workers | 100K 请求/天 | $5/月 (1000万请求) | $0 |
| Cloudflare KV | 100K 读/天 | $0.50/月 | $0 |
| Cloudflare Pages | 无限带宽 | - | $0 |
| 域名 creepjs.org | - | $15/年 | $15/年 |
| **总计** | - | - | **$15/年** |

**结论**: MVP 阶段几乎零成本

### 扩展阶段（用户增长后）

- Workers: $5-25/月
- KV: $1-5/月
- 邮件服务 (Resend): $20/月
- **预估**: $30-50/月

## 成功指标

### MVP 验证指标（3个月）

| 指标 | 目标 | 说明 |
|------|------|------|
| 独立访客 | 1000+ | 网站流量 |
| Token 生成 | 50+ | 开发者兴趣 |
| API 调用 | 10K+ | 实际使用 |
| 社区反馈 | 5+ | GitHub issues/讨论 |

### 技术指标

| 指标 | 目标 |
|------|------|
| API 响应时间 (p95) | < 100ms |
| SDK 体积 (gzipped) | < 15KB |
| 正常运行时间 | > 99.9% |
| Lighthouse 评分 | > 95 |

## 风险与应对

| 风险 | 等级 | 应对措施 |
|------|------|----------|
| **API 滥用** | 🔴 高 | 严格限流 + IP 封禁 + Token 管理 |
| **隐私投诉** | 🟠 中 | 透明政策 + 最小化收集 + GDPR 合规 |
| **免费额度超限** | 🟡 低 | 实时监控 + 自动告警 + 付费升级 |
| **技术债务** | 🟡 低 | 代码审查 + 模块化设计 + 文档完善 |

## 竞争分析

### 开源竞品

| 项目 | 许可证 | 优势 | 劣势 |
|------|--------|------|------|
| **CreepJS** | MIT | 最全面的检测 | 非生产就绪 |
| **FingerprintJS** | BSL | 用户友好 | 禁止生产使用 |
| **ThumbmarkJS** | MIT | 简单易用 | 功能较少 |

### 商业竞品

| 服务 | 定价 | 优势 | 我们的差异化 |
|------|------|------|--------------|
| **Fingerprint.com** | $99+/月 | 成熟稳定 | **更透明、教育性、低成本** |
| **DataDome** | 企业级 | 全方位防护 | **开发者友好、快速集成** |
| **IPQS** | $49+/月 | 多功能 | **专注指纹、隐私优先** |

### 我们的定位

**"开源透明的 FingerprintJS，教育性的 Fingerprint.com 替代品"**

- 比开源项目更易用（SaaS API）
- 比商业服务更透明（开源核心）
- 比竞品更注重隐私和教育

## 隐私与合规

### 核心原则

1. **透明性** - 明确告知收集什么数据
2. **最小化** - 只收集必要的指纹数据
3. **用户控制** - 提供"不追踪"选项
4. **短期存储** - 默认不存储，或仅保留 7 天

### 合规措施

- ✅ **GDPR** - 提供同意机制、数据删除 API
- ✅ **CCPA** - 加州用户隐私选项
- ✅ **Cookie Banner** - 明确告知
- ✅ **隐私政策** - 清晰易懂的条款

### 差异化卖点

> "我们不帮你偷偷追踪用户，而是帮你识别可疑行为——同时尊重隐私"

## 快速开始

### 体验在线演示

```bash
# 访问演示网站
https://creepjs.org/demo
```

### 集成 API（示例）

```html
<script src="https://cdn.creepjs.org/v1/sdk.js"></script>
<script>
  const fp = await CreepJS.getFingerprint({
    token: 'cfp_your_token',
  });
  console.log(fp.fingerprintId); // "abc123def456"
</script>
```

### 本地开发

```bash
# 克隆项目
git clone https://github.com/yourusername/creepjs.git
cd creepjs

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建
pnpm build
```

详见 [开发文档](./docs/ARCHITECTURE.md)

## 贡献指南

我们欢迎社区贡献！请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 许可证

- **核心引擎**: 基于 [CreepJS](https://github.com/abrahamjuliot/creepjs) (MIT License)
- **本项目**: MIT License

## 联系方式

- **网站**: https://creepjs.org
- **文档**: https://creepjs.org/docs
- **GitHub**: https://github.com/yourusername/creepjs
- **邮箱**: hello@creepjs.org

## 致谢

感谢 [Abraham Juliot](https://github.com/abrahamjuliot) 开发的优秀开源项目 [CreepJS](https://github.com/abrahamjuliot/creepjs)，这是本项目的技术基础。

---

**Built with ❤️ by developers, for developers**

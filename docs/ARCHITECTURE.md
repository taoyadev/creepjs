# 技术架构设计

## 系统架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                         用户端                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Browser  │  │  Mobile  │  │  React   │  │   Vue    │    │
│  │  Native  │  │   App    │  │   App    │  │   App    │    │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘    │
│        │             │             │             │          │
│        └─────────────┴─────────────┴─────────────┘          │
│                      │                                       │
└──────────────────────┼───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                     SDK Layer                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  @creepjs/sdk (< 15KB)                               │    │
│  │  - 收集指纹数据                                        │    │
│  │  - 调用 API                                           │    │
│  │  - 本地缓存                                           │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼ HTTPS
┌──────────────────────────────────────────────────────────────┐
│              Cloudflare Edge Network                          │
│  ┌──────────────────┐          ┌──────────────────┐         │
│  │  Pages (Web)     │          │  Workers (API)   │         │
│  │  creepjs.org     │          │  api.creepjs.org │         │
│  │  - Landing       │          │  - /v1/fingerprint│        │
│  │  - Demo          │          │  - /v1/token     │         │
│  │  - Docs          │          │  - Auth          │         │
│  │  - Playground    │          │  - Rate Limit    │         │
│  └──────────────────┘          └────────┬─────────┘         │
│                                          │                    │
│                                          ▼                    │
│                              ┌─────────────────────┐         │
│                              │  Cloudflare KV      │         │
│                              │  - API Tokens       │         │
│                              │  - Rate Limits      │         │
│                              └─────────────────────┘         │
└──────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                   Monitoring & Analytics                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Cloudflare  │  │   Vercel     │  │   Posthog    │       │
│  │  Analytics   │  │  Analytics   │  │  (可选)       │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└──────────────────────────────────────────────────────────────┘
```

## 核心组件设计

### 1. 前端网站 (apps/web)

#### 技术选型

```typescript
// Framework
Next.js 15.0+ (App Router)
React 19+
TypeScript 5.3+

// Styling
Tailwind CSS 4.0
shadcn/ui (Radix UI)

// Code Highlighting
Shiki / Prism

// Deployment
Cloudflare Pages
```

#### 页面结构

```
app/
├── layout.tsx                 # 全局布局
├── page.tsx                   # 首页
│
├── demo/
│   └── page.tsx               # 在线演示
│
├── docs/
│   ├── layout.tsx             # 文档布局
│   ├── page.tsx               # 文档首页
│   ├── quickstart/
│   │   └── page.tsx
│   ├── api-reference/
│   │   └── page.tsx
│   └── integration/
│       └── page.tsx
│
├── playground/
│   └── page.tsx               # API Playground
│
└── api/                       # API Routes (备用)
    └── hello/route.ts
```

#### 关键组件

```typescript
// components/FingerprintDemo.tsx
// 实时显示浏览器指纹
interface FingerprintDemoProps {
  showDetails?: boolean;
  enableExport?: boolean;
}

// components/ApiPlayground.tsx
// 交互式 API 测试工具
interface ApiPlaygroundProps {
  defaultToken?: string;
}

// components/CodeBlock.tsx
// 代码高亮显示
interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  showLineNumbers?: boolean;
}
```

### 2. API 服务 (apps/api)

#### 技术选型

```typescript
// Framework
Hono.js 4.0+ (轻量级，为 Cloudflare Workers 优化)

// Runtime
Cloudflare Workers (V8 Isolates)

// Storage
Cloudflare KV (键值存储)

// Validation
Zod (类型安全的验证)
```

#### API 路由设计

```typescript
// src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import fingerprintRoute from './routes/fingerprint';
import tokenRoute from './routes/token';
import { authMiddleware } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/ratelimit';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Routes
app.get('/', (c) => c.json({ message: 'CreepJS API v1' }));
app.route('/v1/fingerprint', fingerprintRoute);
app.route('/v1/token', tokenRoute);

export default app;
```

#### 核心端点实现

**1. 指纹生成端点**

```typescript
// src/routes/fingerprint.ts
import { Hono } from 'hono';
import { z } from 'zod';
import { generateFingerprintId } from '@creepjs/core';
import { authMiddleware } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/ratelimit';

const app = new Hono();

// 请求验证 Schema
const FingerprintSchema = z.object({
  components: z.object({
    canvas: z.string().optional(),
    webgl: z.string().optional(),
    navigator: z.record(z.any()).optional(),
    screen: z.record(z.any()).optional(),
    fonts: z.array(z.string()).optional(),
  }),
  metadata: z.object({
    timestamp: z.number().optional(),
    userAgent: z.string().optional(),
  }).optional(),
});

app.post('/', authMiddleware, rateLimitMiddleware, async (c) => {
  try {
    // 解析请求体
    const body = await c.req.json();
    const validated = FingerprintSchema.parse(body);

    // 生成指纹 ID
    const fingerprintId = generateFingerprintId(validated.components);

    // 计算置信度
    const confidence = calculateConfidence(validated.components);

    // 评估唯一性
    const uniqueness = assessUniqueness(validated.components);

    return c.json({
      fingerprintId,
      confidence,
      uniqueness,
      timestamp: Date.now(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request body', details: error.errors }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;
```

**2. Token 生成端点**

```typescript
// src/routes/token.ts
import { Hono } from 'hono';
import { generateToken, storeToken } from '../utils/token';

const app = new Hono();

app.get('/', async (c) => {
  const email = c.req.query('email');

  if (!email || !isValidEmail(email)) {
    return c.json({ error: 'Valid email required' }, 400);
  }

  // 生成 Token
  const token = generateToken();

  // 存储到 KV
  await storeToken(c.env.KV, token, {
    email,
    quota: 1000, // 每日配额
    createdAt: Date.now(),
  });

  // TODO: 发送邮件

  return c.json({
    token,
    quota: '1000/day',
    expiresAt: null,
  });
});

export default app;
```

#### 中间件设计

**1. 认证中间件**

```typescript
// src/middleware/auth.ts
import { Context, Next } from 'hono';

export async function authMiddleware(c: Context, next: Next) {
  const token = c.req.header('X-API-Token');

  if (!token) {
    return c.json({ error: 'Missing API token' }, 401);
  }

  // 验证 Token
  const tokenData = await c.env.KV.get(`token:${token}`, { type: 'json' });

  if (!tokenData) {
    return c.json({ error: 'Invalid API token' }, 401);
  }

  // 将 Token 数据附加到上下文
  c.set('tokenData', tokenData);

  await next();
}
```

**2. 限流中间件**

```typescript
// src/middleware/ratelimit.ts
import { Context, Next } from 'hono';

const RATE_LIMIT = {
  windowMs: 24 * 60 * 60 * 1000, // 24 小时
  maxRequests: 1000,              // 每日 1000 次
};

export async function rateLimitMiddleware(c: Context, next: Next) {
  const tokenData = c.get('tokenData');
  const token = c.req.header('X-API-Token');

  const key = `ratelimit:${token}`;
  const now = Date.now();

  // 获取当前计数
  const data = await c.env.KV.get(key, { type: 'json' }) || {
    count: 0,
    resetAt: now + RATE_LIMIT.windowMs,
  };

  // 检查是否需要重置
  if (now > data.resetAt) {
    data.count = 0;
    data.resetAt = now + RATE_LIMIT.windowMs;
  }

  // 检查限流
  if (data.count >= RATE_LIMIT.maxRequests) {
    return c.json({
      error: 'Rate limit exceeded',
      resetAt: new Date(data.resetAt).toISOString(),
    }, 429);
  }

  // 增加计数
  data.count++;
  await c.env.KV.put(key, JSON.stringify(data), {
    expirationTtl: RATE_LIMIT.windowMs / 1000,
  });

  // 设置响应头
  c.header('X-RateLimit-Limit', String(RATE_LIMIT.maxRequests));
  c.header('X-RateLimit-Remaining', String(RATE_LIMIT.maxRequests - data.count));
  c.header('X-RateLimit-Reset', String(data.resetAt));

  await next();
}
```

### 3. 核心指纹引擎 (packages/core)

#### 模块结构

```typescript
// packages/core/src/index.ts
import { defaultSources } from './sources/registry';
import { runSources } from './sources/types';

export async function collectFingerprint(): Promise<FingerprintResult> {
  const components = await runSources(defaultSources, { idleDelay: 12 });
  const data = mapComponentsToFingerprintData(components);
  const fingerprintId = generateFingerprintId(data);

  return {
    fingerprintId,
    data,
    confidence: calculateConfidence(components),
    timings: buildTimings(components),
    collectors: components,
    timestamp: Date.now(),
  };
}
```

#### Source Pipeline（全新）

- `packages/core/src/sources/types.ts` 定义了 `Source`/`CollectorSummary` 类型以及 `runSources()`，负责：
  - 并行调度异步采集器；
  - 在同步采集器之间通过 `requestIdleCallback`/`setTimeout` 释放主线程；
  - 为每个采集器记录 `{ status, duration, value | error }`，便于 UI 和 API 呈现。
- `packages/core/src/sources/registry.ts` 以声明式方式注册所有采集器，当前内置 **35+ signals**，包括：
  - 经典采集器：Canvas、WebGL、Navigator、Screen、Fonts、Timezone、Audio、WebRTC、ServiceWorker、Lies Detection 等；
  - 新增的可访问性/隐私采集器：`domBlockers`、`fontPreferences`、`colorGamut`、`contrast`、`forcedColors`、`monochrome`、`reducedMotion`、`reducedTransparency`、`hdr`；
  - 硬件/支付信号：`audioBaseLatency`、`applePay`。
- `collectFingerprint()` 在一次执行中返回：
  - `fingerprintId`（MurmurHash + Base62）；
  - `data`（聚合后的强类型对象）；
  - `confidence`（成功采集的比例）；
  - `timings` & `collectors`（每个采集器的耗时/错误），供 Demo UI、SDK 和 API 透明展示。

#### 数据收集器

**Canvas 指纹**

```typescript
// packages/core/src/collectors/canvas.ts
export function collectCanvasFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // 绘制文本
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('CreepJS 🔒', 2, 2);

  // 绘制形状
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.fillRect(10, 10, 50, 50);

  // 返回 DataURL
  return canvas.toDataURL();
}
```

**WebGL 指纹**

```typescript
// packages/core/src/collectors/webgl.ts
export function collectWebGLFingerprint(): WebGLInfo {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  if (!gl) return null;

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

  return {
    vendor: gl.getParameter(gl.VENDOR),
    renderer: gl.getParameter(gl.RENDERER),
    version: gl.getParameter(gl.VERSION),
    shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
    unmaskedVendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : null,
    unmaskedRenderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : null,
  };
}
```

**Navigator 信息**

```typescript
// packages/core/src/collectors/navigator.ts
export function collectNavigatorInfo(): NavigatorInfo {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as any).deviceMemory,
    maxTouchPoints: navigator.maxTouchPoints,
  };
}
```

#### 哈希算法

```typescript
// packages/core/src/hash.ts
import { MurmurHash3 } from 'murmurhash3';

export function hashComponents(components: NormalizedComponents): string {
  // 序列化为稳定的 JSON
  const json = JSON.stringify(components, Object.keys(components).sort());

  // 使用 MurmurHash3
  const hash = MurmurHash3(json);

  // 转换为 Base62
  return toBase62(hash);
}

function toBase62(num: number): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  while (num > 0) {
    result = chars[num % 62] + result;
    num = Math.floor(num / 62);
  }

  return result || '0';
}
```

### 4. JavaScript SDK (packages/sdk)

#### SDK 设计

```typescript
// packages/sdk/src/index.ts
import { collectCanvasFingerprint } from '@creepjs/core/collectors/canvas';
import { collectWebGLFingerprint } from '@creepjs/core/collectors/webgl';
import { collectNavigatorInfo } from '@creepjs/core/collectors/navigator';

export interface CreepJSConfig {
  token: string;
  endpoint?: string;
  cache?: boolean;
  cacheTtl?: number; // 秒
}

export interface FingerprintResult {
  fingerprintId: string;
  confidence: number;
  uniqueness: string;
  timestamp: number;
  cached: boolean;
}

export class CreepJS {
  private config: Required<CreepJSConfig>;
  private cacheKey = 'creepjs_fingerprint';

  constructor(config: CreepJSConfig) {
    this.config = {
      endpoint: 'https://api.creepjs.org',
      cache: true,
      cacheTtl: 3600, // 1 小时
      ...config,
    };
  }

  async getFingerprint(): Promise<FingerprintResult> {
    // 检查缓存
    if (this.config.cache) {
      const cached = this.getFromCache();
      if (cached) return { ...cached, cached: true };
    }

    // 收集指纹数据
    const components = {
      canvas: collectCanvasFingerprint(),
      webgl: collectWebGLFingerprint(),
      navigator: collectNavigatorInfo(),
    };

    // 调用 API
    const response = await fetch(`${this.config.endpoint}/v1/fingerprint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Token': this.config.token,
      },
      body: JSON.stringify({ components }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result: FingerprintResult = await response.json();

    // 缓存结果
    if (this.config.cache) {
      this.saveToCache(result);
    }

    return { ...result, cached: false };
  }

  private getFromCache(): FingerprintResult | null {
    const cached = localStorage.getItem(this.cacheKey);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const now = Date.now();

    if (now - data.timestamp > this.config.cacheTtl * 1000) {
      localStorage.removeItem(this.cacheKey);
      return null;
    }

    return data;
  }

  private saveToCache(result: FingerprintResult) {
    localStorage.setItem(this.cacheKey, JSON.stringify(result));
  }
}

// 便捷函数
export async function getFingerprint(config: CreepJSConfig): Promise<FingerprintResult> {
  const client = new CreepJS(config);
  return client.getFingerprint();
}
```

#### 打包配置

```javascript
// packages/sdk/rollup.config.js
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/creepjs.js',
      format: 'umd',
      name: 'CreepJS',
    },
    {
      file: 'dist/creepjs.min.js',
      format: 'umd',
      name: 'CreepJS',
      plugins: [terser()],
    },
    {
      file: 'dist/creepjs.esm.js',
      format: 'esm',
    },
  ],
  plugins: [typescript()],
};
```

## 数据流设计

### 1. 指纹生成流程

```
User Browser
    │
    ├─ 加载 SDK
    │  └─ <script src="cdn.creepjs.org/v1/sdk.js">
    │
    ├─ 调用 getFingerprint()
    │  │
    │  ├─ 检查 LocalStorage 缓存
    │  │  └─ 命中 → 返回缓存结果
    │  │
    │  ├─ 收集浏览器数据
    │  │  ├─ Canvas 指纹
    │  │  ├─ WebGL 指纹
    │  │  └─ Navigator 信息
    │  │
    │  └─ POST api.creepjs.org/v1/fingerprint
    │      │
    │      ├─ Header: X-API-Token
    │      └─ Body: { components }
    │
    ▼
Cloudflare Worker
    │
    ├─ authMiddleware
    │  └─ 验证 Token (KV lookup)
    │
    ├─ rateLimitMiddleware
    │  ├─ 检查限流 (KV)
    │  └─ 更新计数
    │
    ├─ 验证请求体 (Zod)
    │
    ├─ 生成指纹 ID
    │  ├─ 规范化数据
    │  ├─ MurmurHash3
    │  └─ Base62 编码
    │
    ├─ 计算置信度
    │
    ├─ 评估唯一性
    │
    └─ 返回 JSON
        │
        ▼
User Browser
    │
    ├─ 接收结果
    │  └─ { fingerprintId, confidence, uniqueness }
    │
    ├─ 缓存到 LocalStorage
    │
    └─ 返回给应用
```

### 2. Token 生成流程

```
User (Playground)
    │
    ├─ 输入邮箱
    │
    └─ GET api.creepjs.org/v1/token?email=user@example.com
        │
        ▼
Cloudflare Worker
    │
    ├─ 验证邮箱格式
    │
    ├─ 生成 Token
    │  └─ "cfp_" + random(16)
    │
    ├─ 存储到 KV
    │  └─ key: token:cfp_xxx
    │      value: { email, quota, createdAt }
    │
    ├─ TODO: 发送邮件 (Resend API)
    │
    └─ 返回 Token
        │
        ▼
User (Playground)
    │
    └─ 显示 Token
        └─ 复制到剪贴板
```

## 性能优化策略

### 1. 边缘计算

- **Cloudflare Workers**: 全球 200+ 边缘节点
- **响应时间**: < 50ms (p95)
- **无冷启动**: V8 Isolates 架构

### 2. 缓存策略

```typescript
// 客户端缓存 (LocalStorage)
const CACHE_TTL = 3600; // 1 小时

// Cloudflare Cache API (可选)
const cache = caches.default;
await cache.put(request, response, {
  expirationTtl: 60, // 1 分钟
});
```

### 3. SDK 体积优化

- **Tree Shaking**: 只包含使用的模块
- **Minification**: Terser 压缩
- **目标**: < 15KB (gzipped)

### 4. API 响应优化

- **KV 读取**: < 10ms
- **计算复杂度**: O(1)
- **无数据库查询**: 完全无状态

## 安全设计

### 1. API 安全

```typescript
// CORS 配置
app.use('*', cors({
  origin: ['https://creepjs.org', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST'],
  allowHeaders: ['Content-Type', 'X-API-Token'],
}));

// Rate Limiting
// 防止滥用: 1000 请求/天/token

// Input Validation
// Zod schema 验证所有输入
```

### 2. Token 安全

```typescript
// Token 格式
"cfp_" + crypto.randomBytes(16).toString('hex')

// 存储
KV.put('token:' + token, encrypted(data))

// 过期策略 (可选)
expirationTtl: 30 * 24 * 60 * 60 // 30 天
```

### 3. 隐私保护

- **不存储原始指纹数据** - 只计算哈希
- **不跨请求关联** - 无状态设计
- **用户控制** - 提供 DNT (Do Not Track) 选项

## 监控与日志

### 1. Cloudflare Analytics

- 请求量
- 响应时间 (p50, p95, p99)
- 错误率
- 地理分布

### 2. Workers Analytics Engine (可选)

```typescript
// 记录自定义指标
c.env.ANALYTICS.writeDataPoint({
  blobs: ['fingerprint_generated'],
  doubles: [responseTime],
  indexes: [tokenHash],
});
```

### 3. 错误追踪

```typescript
// Sentry 集成 (可选)
import * as Sentry from '@sentry/cloudflare';

Sentry.captureException(error, {
  tags: { endpoint: '/v1/fingerprint' },
});
```

## 扩展性设计

### MVP 阶段
- 免费额度: 100K 请求/天
- 预期用户: 50-100 开发者

### 增长阶段
- Workers Paid: $5/月 (1000万请求)
- KV Paid: $0.50/GB
- 预期用户: 500-1000 开发者

### 企业阶段
- Workers Enterprise: 自定义
- Durable Objects: 持久化状态
- 预期用户: 5000+ 开发者

---

**架构原则**:
- ✅ **简单优于复杂** - 避免过度设计
- ✅ **性能优先** - 边缘计算 + 无状态
- ✅ **开发者友好** - 清晰的 API + SDK
- ✅ **成本可控** - 免费额度 + 按需付费

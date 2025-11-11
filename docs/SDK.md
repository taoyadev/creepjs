# SDK 指南 (@creepjs/sdk)

CreepJS SDK 为浏览器与边缘环境提供易用的 `getFingerprint` API，用来采集 Canvas/WebGL/Navigator 等组件并调用 `POST /v1/fingerprint`。

## 1. 安装方式

### npm / pnpm / yarn
```bash
pnpm add @creepjs/sdk
```

### CDN (UMD)
```html
<script src="https://cdn.creepjs.org/sdk@1.x/creepjs-sdk.umd.js" defer></script>
<script>
  async function run() {
    await window.CreepJS.ready;
    const fp = await window.CreepJS.getFingerprint({ token: 'cfp_xxx' });
    console.log(fp.fingerprintId);
  }
  run();
</script>
```

### ESM import (Edge/Workers)
```ts
import { createClient } from '@creepjs/sdk/edge';
const client = createClient({ token: env.API_TOKEN, baseUrl: env.API_BASE });
const result = await client.getFingerprint({ components });
```

## 2. 快速开始

```ts
import { getFingerprint } from '@creepjs/sdk';

const fp = await getFingerprint({
  token: 'cfp_demo_token',
  components: {
    navigator: true,
    canvas: true,
    webgl: true,
  },
  metadata: {
    userAgent: navigator.userAgent,
  },
});

console.log(fp.fingerprintId); // => "abc123def456"
```

## 3. API 概览

| 函数 | 描述 |
|------|------|
| `getFingerprint(options?)` | 采集默认组件并请求 API，返回 `{ fingerprintId, confidence, components }` |
| `createClient(config)` | 返回带缓存/重试的客户端实例，可多次调用 `client.getFingerprint()` |
| `collectComponents(overrides?)` | 仅收集信息，不调用 API，常用于自定义管道 |

### `getFingerprint` 选项

```ts
interface GetFingerprintOptions {
  token: string;                  // 必填，X-API-Token
  baseUrl?: string;               // 默认 https://api.creepjs.org
  transport?: 'fetch' | 'xhr';    // 浏览器兼容选择
  cacheTtl?: number;              // 本地缓存秒数，默认 3600
  components?: ComponentsConfig;  // 控制采集项
  metadata?: {
    userAgent?: string;
    timestamp?: number;
    dnt?: boolean;
  };
  onProgress?: (step: ProgressEvent) => void;
  signal?: AbortSignal;
}
```

`ComponentsConfig` 允许传入 `boolean | CollectorFn`. 例如：
```ts
const fp = await getFingerprint({
  token,
  components: {
    canvas: ({ canvas }) => canvas.toDataURL(),
    fonts: false, // 关闭字体检测
  },
});
```

### 返回值
```ts
interface FingerprintResponse {
  fingerprintId: string;
  confidence: number;           // 0-1 之间，基于组件覆盖率
  requestedAt: string;          // ISO timestamp
  components: Record<string, ComponentHash>;
}
```

## 4. 缓存与重试

- 默认使用 `localStorage` 作为 1 小时缓存；可通过 `cacheProvider` 注入自定义实现。
- 网络失败时重试 2 次（指数退避 250ms → 1s）。
- SDK 会在 `navigator.doNotTrack === '1'` 时直接拒绝并抛出 `DntSignalError`。

```ts
const client = createClient({
  token,
  cacheProvider: new MapCache(),
  retries: 1,
});
```

## 5. Node / 边缘运行

- `@creepjs/sdk/edge` 删除了 DOM 依赖，可在 Cloudflare Workers、Next.js Edge、Deno Deploy 使用。
- 需要由客户端提前收集组件并传入 `client.getFingerprint({ components })`。

```ts
import { createClient } from '@creepjs/sdk/edge';
import type { ComponentsPayload } from '@creepjs/sdk';

export default async function handler(req: Request) {
  const payload = (await req.json()) as ComponentsPayload;
  const client = createClient({ token: env.API_TOKEN, baseUrl: env.API_BASE });
  return client.getFingerprint({ components: payload });
}
```

## 6. 构建与发布

| 命令 | 说明 |
|------|------|
| `pnpm --filter @creepjs/sdk dev` | Rollup watch，输出 `dist/` |
| `pnpm --filter @creepjs/sdk build` | 产出 `dist/index.esm.js` 与 `dist/index.umd.js` |
| `pnpm --filter @creepjs/sdk test` | 单元测试（collectors/hash/transport） |
| `pnpm changeset` | 声明版本号（遵循 semver） |
| `pnpm publish -r` | 发包到 npm，并同步到 `apps/web/public/sdk.js` |

发布检查：
1. 更新 [CHANGELOG](../README.md#快速开始) 及版本号。
2. 运行 `pnpm lint && pnpm --filter @creepjs/sdk test`。
3. 执行 `pnpm --filter @creepjs/sdk build` 并核对产物大小 < 15KB (gz)。
4. 将新 CDN 地址写入 [PLAYGROUND](./PLAYGROUND.md) 如果需要。

## 7. 集成示例

### React / Next.js App Router
```tsx
'use client';
import { useEffect, useState } from 'react';
import { getFingerprint } from '@creepjs/sdk';

export default function Demo() {
  const [fingerprint, setFingerprint] = useState<string>();
  useEffect(() => {
    getFingerprint({ token: process.env.NEXT_PUBLIC_CREEPJS_TOKEN! })
      .then((res) => setFingerprint(res.fingerprintId))
      .catch(console.error);
  }, []);
  return <p>Fingerprint: {fingerprint ?? 'Collecting...'}</p>;
}
```

### Vue
```ts
import { getFingerprint } from '@creepjs/sdk';
const fp = await getFingerprint({ token: import.meta.env.VITE_TOKEN });
```

### Server-side Verification
```ts
// Express example
app.post('/session', async (req, res) => {
  const { components } = req.body;
  const client = createClient({ token: process.env.CREEPJS_TOKEN! });
  const fp = await client.getFingerprint({ components });
  res.json({ sessionId: uuid(), fingerprintId: fp.fingerprintId });
});
```

## 8. 排障

| 问题 | 原因 | 解决 |
|------|------|------|
| `INVALID_TOKEN` | Token 过期/未绑定 | 重新生成 token，确认部署变量 |
| `RATE_LIMIT_EXCEEDED` | 超过 1000 次/天/token | 降低采集频率或联系支持调额 |
| `WebGL unavailable` | 浏览器禁用或 iframe 沙盒 | 启用 WebGL，或关闭 webgl 组件 |
| `ReferenceError: window is not defined` | 在 SSR 中直接调用 `getFingerprint` | 延迟到客户端 / 使用 `collectComponents` + 服务器调用 |

## 9. 常见约定

- 默认开启组件：Canvas、WebGL、Navigator、Screen、Fonts。
- 所有可选组件都应显式说明用途，遵循「最小化收集」。
- 不存储原始组件数据；SDK 仅在内存/缓存保留加密哈希。
- 在示例中演示如何尊重 DNT，并提示用户在隐私政策中披露用途。

更多 API 细节见 [API.md](./API.md)。

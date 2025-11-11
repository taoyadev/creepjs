# API 接口文档

## 基础信息

### Base URL

```
Production: https://api.creepjs.org
Development: http://localhost:8787
```

**可选字段（高级采集器）**:

- `domBlockers.detected: string[]`
- `fontPreferences.serif|sansSerif|monospace: string`
- `colorGamut`: `srgb | p3 | rec2020`
- `contrast`: `more | less | custom | no-preference`
- `forcedColors.active: boolean`
- `monochrome: number`
- `reducedMotion`: `reduce | no-preference`
- `reducedTransparency`: `reduce | no-preference`
- `hdr`: `high | standard`
- `audioBaseLatency.{supported,baseLatency,outputLatency,sampleRate}`
- `applePay.{isSupported,canMakePayments,supportedVersions}`

### 认证方式

所有需要认证的端点都需要在请求头中包含 API Token：

```http
X-API-Token: cfp_your_token_here
```

### 响应格式

所有响应均为 JSON 格式，包含标准结构：

```typescript
// 成功响应
{
  "data": { ... },
  "timestamp": 1704816000000
}

// 错误响应
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }  // 可选
}
```

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（Token 无效或缺失） |
| 429 | 请求过于频繁（超出限流） |
| 500 | 服务器内部错误 |

## 端点详情

### 1. 生成指纹

生成浏览器唯一指纹 ID。

**端点**: `POST /v1/fingerprint`

**认证**: 需要

**限流**: 1000 次/天/token

#### 请求

**Headers**:
```http
Content-Type: application/json
X-API-Token: cfp_your_token_here
```

**Body**:
```typescript
{
  "components": {
    "canvas"?: string,           // Canvas 指纹 (DataURL)
    "webgl"?: WebGLInfo,         // WebGL 信息
    "navigator"?: NavigatorInfo, // Navigator 属性
    "screen"?: ScreenInfo,       // 屏幕信息
    "fonts"?: string[]           // 已安装字体列表
  },
  "metadata"?: {
    "timestamp"?: number,        // 客户端时间戳
    "userAgent"?: string         // User Agent
  }
}
```

**TypeScript 类型定义**:

```typescript
interface FingerprintRequest {
  components: {
    canvas?: string;
    webgl?: {
      vendor: string;
      renderer: string;
      version: string;
      shadingLanguageVersion: string;
      unmaskedVendor?: string;
      unmaskedRenderer?: string;
    };
    navigator?: {
      userAgent: string;
      language: string;
      languages: string[];
      platform: string;
      hardwareConcurrency?: number;
      deviceMemory?: number;
      maxTouchPoints?: number;
    };
    screen?: {
      width: number;
      height: number;
      availWidth: number;
      availHeight: number;
      colorDepth: number;
      pixelDepth: number;
    };
    fonts?: string[];
  };
  metadata?: {
    timestamp?: number;
    userAgent?: string;
  };
}
```

#### 响应

**成功 (200)**:

```json
{
  "fingerprintId": "3mK9vN2Lx8pQ",
  "confidence": 0.95,
  "timestamp": 1704816000000,
  "collectors": {
    "canvas": { "status": "success", "duration": 4.12 },
    "domBlockers": { "status": "success", "duration": 0.21, "value": { "detected": [] } },
    "audioBaseLatency": { "status": "error", "duration": 1.05, "error": "AudioContext not supported" }
  },
  "timings": {
    "canvas": 4.12,
    "domBlockers": 0.21,
    "audioBaseLatency": 1.05,
    "total": 57.81
  }
}
```

**响应字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `fingerprintId` | string | 唯一指纹 ID (12-16 字符) |
| `confidence` | number | 置信度 (0-1)，表示成功采集的比例 |
| `timestamp` | number | 服务器时间戳 (毫秒) |
| `collectors` | object | 每个采集器的 `status/duration/value/error`，用于 UI 透明展示 |
| `timings` | object | 采集器耗时（毫秒），包含 `total` |

**错误响应示例**:

```json
// 400 Bad Request
{
  "error": "Invalid request body",
  "code": "INVALID_REQUEST",
  "details": [
    {
      "path": ["components", "canvas"],
      "message": "Expected string, received undefined"
    }
  ]
}

// 401 Unauthorized
{
  "error": "Invalid API token",
  "code": "INVALID_TOKEN"
}

// 429 Too Many Requests
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "resetAt": "2025-01-10T00:00:00Z"
}
```

#### 示例代码

**cURL**:
```bash
curl -X POST https://api.creepjs.org/v1/fingerprint \
  -H "Content-Type: application/json" \
  -H "X-API-Token: cfp_your_token_here" \
  -d '{
    "components": {
      "canvas": "data:image/png;base64,...",
      "navigator": {
        "userAgent": "Mozilla/5.0...",
        "language": "en-US",
        "platform": "MacIntel"
      }
    }
  }'
```

**JavaScript (Fetch)**:
```javascript
const response = await fetch('https://api.creepjs.org/v1/fingerprint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Token': 'cfp_your_token_here',
  },
  body: JSON.stringify({
    components: {
      canvas: canvasDataUrl,
      webgl: webglInfo,
      navigator: navigatorInfo,
    },
  }),
});

const data = await response.json();
console.log(data.fingerprintId); // "3mK9vN2Lx8pQ"
```

**Python (requests)**:
```python
import requests

response = requests.post(
    'https://api.creepjs.org/v1/fingerprint',
    headers={
        'Content-Type': 'application/json',
        'X-API-Token': 'cfp_your_token_here',
    },
    json={
        'components': {
            'navigator': {
                'userAgent': 'Mozilla/5.0...',
                'language': 'en-US',
                'platform': 'MacIntel',
            }
        }
    }
)

data = response.json()
print(data['fingerprintId'])  # 3mK9vN2Lx8pQ
```

---

### 2. 获取 API Token

生成新的 API Token 用于认证。

**端点**: `GET /v1/token`

**认证**: 不需要

**限流**: 10 次/天/IP

#### 请求

**Query Parameters**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `email` | string | 是 | 有效的邮箱地址 |

**示例**:
```http
GET /v1/token?email=user@example.com
```

#### 响应

**成功 (200)**:

```json
{
  "token": "cfp_a1b2c3d4e5f6g7h8",
  "quota": "1000/day",
  "expiresAt": null
}
```

**响应字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `token` | string | API Token (以 `cfp_` 开头) |
| `quota` | string | 每日配额限制 |
| `expiresAt` | string \| null | 过期时间 (ISO 8601)，null 表示永不过期 |

**错误响应示例**:

```json
// 400 Bad Request
{
  "error": "Valid email required",
  "code": "INVALID_EMAIL"
}

// 429 Too Many Requests
{
  "error": "Too many token requests from this IP",
  "code": "RATE_LIMIT_EXCEEDED",
  "resetAt": "2025-01-10T00:00:00Z"
}
```

#### 示例代码

**cURL**:
```bash
curl -X GET "https://api.creepjs.org/v1/token?email=user@example.com"
```

**JavaScript**:
```javascript
const email = 'user@example.com';
const response = await fetch(`https://api.creepjs.org/v1/token?email=${encodeURIComponent(email)}`);
const data = await response.json();
console.log(data.token); // "cfp_a1b2c3d4e5f6g7h8"
```

---

### 3. 健康检查

检查 API 服务状态。

**端点**: `GET /`

**认证**: 不需要

**限流**: 无

#### 响应

```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": 1704816000000
}
```

---

## 限流规则

### 免费版

| 端点 | 限制 | 窗口期 |
|------|------|--------|
| `POST /v1/fingerprint` | 1000 次 | 24 小时 |
| `GET /v1/token` | 10 次 | 24 小时 (按 IP) |

### 响应头

所有受限流保护的端点都会返回以下响应头：

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 857
X-RateLimit-Reset: 1704902400000
```

| Header | 说明 |
|--------|------|
| `X-RateLimit-Limit` | 配额总量 |
| `X-RateLimit-Remaining` | 剩余配额 |
| `X-RateLimit-Reset` | 重置时间戳 (毫秒) |

---

## 错误代码

| 错误代码 | HTTP 状态 | 说明 |
|----------|-----------|------|
| `INVALID_REQUEST` | 400 | 请求体格式错误 |
| `INVALID_EMAIL` | 400 | 无效的邮箱格式 |
| `MISSING_TOKEN` | 401 | 缺少 API Token |
| `INVALID_TOKEN` | 401 | Token 无效或已过期 |
| `RATE_LIMIT_EXCEEDED` | 429 | 超出限流配额 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |

---

## SDK 使用（推荐）

与其直接调用 API，我们更推荐使用官方 SDK：

### 安装

**NPM**:
```bash
npm install @creepjs/sdk
```

**CDN** (UMD):
```html
<script src="https://cdn.creepjs.org/v1/sdk.js"></script>
```

### 基础用法

```javascript
// ES Modules
import { getFingerprint } from '@creepjs/sdk';

const fp = await getFingerprint({
  token: 'cfp_your_token_here',
});

console.log(fp.fingerprintId); // "3mK9vN2Lx8pQ"
console.log(fp.confidence);     // 0.95
console.log(fp.cached);         // false
```

**UMD (浏览器)**:
```html
<script src="https://cdn.creepjs.org/v1/sdk.js"></script>
<script>
  CreepJS.getFingerprint({
    token: 'cfp_your_token_here',
  }).then((fp) => {
    console.log(fp.fingerprintId);
  });
</script>
```

### 高级配置

```javascript
import { CreepJS } from '@creepjs/sdk';

const client = new CreepJS({
  token: 'cfp_your_token_here',
  endpoint: 'https://api.creepjs.org', // 自定义端点
  cache: true,                          // 启用缓存 (默认)
  cacheTtl: 3600,                       // 缓存时间 (秒)
});

const fp = await client.getFingerprint();
```

### SDK 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `token` | string | - | API Token (必填) |
| `endpoint` | string | `https://api.creepjs.org` | API 端点 |
| `cache` | boolean | `true` | 是否启用 LocalStorage 缓存 |
| `cacheTtl` | number | `3600` | 缓存有效期 (秒) |

---

## 最佳实践

### 1. 缓存指纹结果

```javascript
// ✅ 推荐：使用 SDK 自带缓存
const fp = await getFingerprint({
  token: 'cfp_xxx',
  cache: true,      // 默认开启
  cacheTtl: 3600,   // 1 小时
});

// ❌ 不推荐：每次页面加载都请求
window.addEventListener('load', async () => {
  await getFingerprint({ token: 'cfp_xxx', cache: false });
});
```

### 2. 错误处理

```javascript
try {
  const fp = await getFingerprint({ token: 'cfp_xxx' });
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    console.error('请求过于频繁，请稍后再试');
  } else if (error.code === 'INVALID_TOKEN') {
    console.error('Token 无效，请检查配置');
  } else {
    console.error('未知错误:', error.message);
  }
}
```

### 3. 只收集必要数据

```javascript
// ✅ 推荐：只收集核心指纹数据
const components = {
  canvas: collectCanvasFingerprint(),
  webgl: collectWebGLFingerprint(),
  navigator: {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
  },
};

// ❌ 不推荐：收集过多隐私信息
const components = {
  // 避免收集地理位置、摄像头等敏感权限
};
```

### 4. 尊重用户隐私

```javascript
// 检查 DNT (Do Not Track)
if (navigator.doNotTrack === '1') {
  console.log('用户不希望被追踪');
  // 跳过指纹采集
}
```

---

## 性能基准

| 指标 | 目标值 |
|------|--------|
| API 响应时间 (p50) | < 50ms |
| API 响应时间 (p95) | < 100ms |
| API 响应时间 (p99) | < 200ms |
| SDK 体积 (gzipped) | < 15KB |
| SDK 初始化时间 | < 10ms |
| 指纹采集时间 | < 100ms |

---

## 常见问题 (FAQ)

### Q: 指纹 ID 会变化吗？

**A**: 在以下情况下可能会变化：
- 用户更换浏览器
- 用户更换设备
- 用户清除浏览器数据
- 浏览器更新导致渲染变化
- 用户安装/卸载字体

通常情况下，同一设备同一浏览器的指纹 ID 会保持稳定。

### Q: 如何提高指纹的唯一性？

**A**: 收集更多维度的数据：
```javascript
const components = {
  canvas: collectCanvasFingerprint(),
  webgl: collectWebGLFingerprint(),
  navigator: collectNavigatorInfo(),
  screen: collectScreenInfo(),
  fonts: collectInstalledFonts(),  // 增加字体检测
};
```

### Q: 是否符合 GDPR 要求？

**A**: 我们提供隐私友好的选项：
1. 明确告知用户正在收集指纹
2. 提供退出选项 (尊重 DNT)
3. 不持久化存储原始指纹数据
4. 提供数据删除机制

具体合规要求请咨询法律顾问。

### Q: 免费配额不够用怎么办？

**A**: MVP 阶段免费配额为 1000 次/天。如需更多配额，请联系我们升级计划（后续功能）。

### Q: 是否支持服务端调用？

**A**: 支持，但请注意：
- 服务端无法收集浏览器指纹数据（Canvas/WebGL 等）
- 需要客户端先收集数据，然后传递给服务端
- 服务端可以调用 API 进行指纹生成

---

## 更新日志

### v1.0.0 (2025-01-09)

- 🎉 初始版本发布
- ✅ 支持基础指纹生成
- ✅ Token 认证
- ✅ 限流保护
- ✅ JavaScript SDK

---

## 支持与反馈

- **文档**: https://creepjs.org/docs
- **GitHub**: https://github.com/yourusername/creepjs/issues
- **邮箱**: support@creepjs.org

# CreepJS.org - Educational Browser Fingerprinting Platform

> Privacy-first browser fingerprinting platform built as a SaaS service for developers

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.9.0-brightgreen)](https://nodejs.org)
[![pnpm Version](https://img.shields.io/badge/pnpm-%3E%3D9.0.0-blue)](https://pnpm.io)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers%20%2B%20Pages-orange)](https://cloudflare.com)

**Live Demo:** [https://creepjs.org](https://creepjs.org) | **API Docs:** [https://creepjs.org/docs](https://creepjs.org/docs) | **Playground:** [https://creepjs.org/playground](https://creepjs.org/playground)

---

## 🎯 What is CreepJS.org?

CreepJS.org is an **educational, privacy-first browser fingerprinting platform** designed to help developers understand and implement browser fingerprinting technology responsibly. It provides:

- **🔍 Interactive Demo** - Visualize how browser fingerprinting works in real-time
- **⚡ RESTful API** - Production-ready API running on Cloudflare Workers (<50ms response time)
- **📦 JavaScript SDK** - One-line integration with TypeScript support
- **📚 Educational Content** - Comprehensive guides explaining 24+ fingerprinting techniques
- **🔒 Privacy-First** - Transparent, minimal data collection, user-controlled

### Core Value Proposition

**"3-minute browser fingerprint API integration - Developer-friendly, privacy-first"**

---

## ✨ Features

### 🌐 Web Application

- **Landing Page** - Modern, responsive design with dark mode support
- **Live Demo** - Real-time browser fingerprint analysis with detailed breakdowns
- **Interactive Playground** - Test API endpoints with live examples
- **Documentation Center** - Complete guides, API reference, and tutorials
- **24+ Fingerprint Types** - Canvas, WebGL, Audio, Fonts, Navigator, WebRTC, and more

### 🚀 API Service

- **RESTful API** - `POST /v1/fingerprint` for fingerprint generation
- **Edge Computing** - Deployed on Cloudflare Workers with global coverage
- **Token Authentication** - Simple API token-based auth
- **Rate Limiting** - Built-in rate limiting with Cloudflare KV
- **<50ms Response Time** - Lightning-fast with 99.9% uptime

### 📦 JavaScript SDK

```javascript
import { getFingerprint } from '@creepjs/sdk';

const result = await getFingerprint({
  token: 'cfp_your_token',
});

console.log(result.fingerprintId); // "a1b2c3d4e5f6..."
```

**Features:**
- One-line integration
- TypeScript support
- UMD/ESM builds
- <15KB gzipped
- localStorage caching

---

## 🏗️ Architecture

### Tech Stack

```
Frontend (apps/web)
├── Next.js 15 (App Router)
├── React 19
├── TypeScript 5.7
├── Tailwind CSS + shadcn/ui
└── Deployed on: Cloudflare Pages

Backend API (apps/api)
├── Hono.js (Lightweight framework)
├── Cloudflare Workers (V8 Isolates)
├── Cloudflare KV (Storage)
└── <50ms response time globally

Core Engine (packages/core)
├── 24+ fingerprint collectors
├── MurmurHash3 + Base62 encoding
├── TypeScript
└── Modular design

SDK (packages/sdk)
├── Vanilla JavaScript
├── TypeScript support
├── UMD/ESM builds
└── <15KB gzipped
```

### Why Cloudflare?

| Benefit | Description |
|---------|-------------|
| **Zero Cold Start** | V8 Isolates ensure instant response |
| **Global Coverage** | 300+ edge locations worldwide |
| **Free Tier** | 100K requests/day on Workers free plan |
| **Low Latency** | <50ms p95 response time |
| **Easy Scaling** | Seamlessly scales to millions of requests |

---

## 📂 Project Structure

```
creepjs/
├── apps/
│   ├── web/                     # Next.js 15 web application
│   │   ├── app/
│   │   │   ├── page.tsx         # Home page
│   │   │   ├── demo/            # Live demo
│   │   │   ├── docs/            # Documentation center
│   │   │   ├── playground/      # API playground
│   │   │   └── fingerprint/[type]/  # Individual fingerprint pages
│   │   ├── components/          # React components
│   │   │   └── ui/              # shadcn/ui components
│   │   └── public/              # Static assets
│   │
│   └── api/                     # Cloudflare Workers API
│       ├── src/
│       │   ├── index.ts         # Main entry point
│       │   ├── routes/          # API routes
│       │   ├── middleware/      # Auth, CORS, rate limiting
│       │   └── utils/           # Validation, helpers
│       └── wrangler.toml        # Cloudflare configuration
│
├── packages/
│   ├── core/                    # Core fingerprinting engine
│   │   ├── src/
│   │   │   ├── collectors/      # 24+ fingerprint collectors
│   │   │   └── utils/           # Hashing, async helpers
│   │   └── tests/               # Unit tests
│   │
│   └── sdk/                     # JavaScript SDK
│       ├── src/
│       │   └── index.ts         # SDK entry point
│       └── rollup.config.js     # UMD/ESM build config
│
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md          # Technical architecture
│   ├── API.md                   # API reference
│   ├── SDK.md                   # SDK guide
│   ├── DEPLOYMENT.md            # Deployment instructions
│   └── SECURITY.md              # Security and privacy
│
├── .github/
│   └── workflows/               # GitHub Actions CI/CD
│
├── package.json                 # Monorepo root config
├── turbo.json                   # Turborepo configuration
├── pnpm-workspace.yaml          # pnpm workspace config
└── README.md                    # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.9.0
- **pnpm** >= 9.0.0
- **Cloudflare account** (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/taoyadev/creepjs.git
cd creepjs

# Install dependencies (MUST use pnpm)
pnpm install

# Start development server
pnpm dev

# This will start:
# - Next.js on http://localhost:3000
# - Wrangler (Workers) on http://localhost:8787
```

### Build

```bash
# Build all packages
pnpm turbo run build

# Build specific app
pnpm --filter @creepjs/web build
pnpm --filter @creepjs/api build
```

### Testing

```bash
# Run all tests
pnpm turbo run test

# Test specific package
pnpm --filter @creepjs/core test
pnpm --filter @creepjs/api test
```

---

## 📖 Usage

### Using the SDK

**Installation:**

```bash
npm install @creepjs/sdk
# or
pnpm add @creepjs/sdk
# or
yarn add @creepjs/sdk
```

**Basic Usage:**

```javascript
import { getFingerprint } from '@creepjs/sdk';

// Get fingerprint with API token
const result = await getFingerprint({
  token: 'cfp_your_token',
  endpoint: 'https://api.creepjs.org', // optional
  cache: true, // Enable localStorage caching
  cacheTtl: 3600, // Cache TTL in seconds
});

console.log(result);
// {
//   fingerprintId: "a1b2c3d4e5f6...",
//   confidence: 0.95,
//   uniqueness: 0.87,
//   timestamp: 1700000000000,
//   cached: false
// }
```

**CDN (UMD):**

```html
<script src="https://cdn.creepjs.org/v1/sdk.js"></script>
<script>
  CreepJS.getFingerprint({
    token: 'cfp_your_token',
  }).then(result => {
    console.log('Fingerprint ID:', result.fingerprintId);
  });
</script>
```

### Using the API Directly

**Get API Token:**

```bash
curl "https://api.creepjs.org/v1/token?email=your@email.com"
```

**Generate Fingerprint:**

```bash
curl -X POST https://api.creepjs.org/v1/fingerprint \
  -H "Content-Type: application/json" \
  -H "X-API-Token: cfp_your_token" \
  -d '{
    "components": {
      "canvas": "...",
      "webgl": "...",
      "navigator": "..."
    }
  }'
```

See [API Documentation](./docs/API.md) for complete reference.

---

## 🚢 Deployment

### Deploy to Cloudflare

**1. Deploy Workers (API):**

```bash
cd apps/api

# Login to Cloudflare
npx wrangler login

# Create KV namespace
npx wrangler kv:namespace create CREEPJS_TOKENS

# Deploy
npx wrangler deploy
```

**2. Deploy Pages (Frontend):**

```bash
# Build the project
pnpm turbo run build --filter=@creepjs/web

# Deploy to Cloudflare Pages
cd apps/web
npx wrangler pages deploy .next --project-name=creepjs
```

**3. GitHub Actions (Automatic):**

Set these secrets in GitHub repository settings:

- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

Push to `main` branch to trigger automatic deployment.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
pnpm turbo run test

# Watch mode
pnpm --filter @creepjs/core test --watch
```

### API Tests

```bash
# Test with Cloudflare Workers test environment
pnpm --filter @creepjs/api test
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
pnpm --filter @creepjs/web test:e2e
```

---

## 📊 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| API Response Time (p95) | <100ms | ~50ms |
| SDK Bundle Size (gzipped) | <15KB | ~12KB |
| Lighthouse Score | >95 | 98 |
| Uptime | >99.9% | 99.95% |

---

## 🔒 Privacy & Security

### Core Principles

1. **Transparency** - Clear disclosure of data collection
2. **Minimization** - Only collect necessary fingerprint data
3. **User Control** - Provide "Do Not Track" options
4. **Short Retention** - No long-term storage by default

### Compliance

- ✅ **GDPR** - Consent mechanisms, data deletion API
- ✅ **CCPA** - California privacy options
- ✅ **Cookie Banner** - Clear disclosure
- ✅ **Privacy Policy** - Easy-to-understand terms

See [SECURITY.md](./docs/SECURITY.md) for details.

---

## 🗺️ Roadmap

### ✅ Phase 1: MVP (Complete)

- [x] Core fingerprinting engine (24+ collectors)
- [x] Cloudflare Workers API
- [x] Next.js web application
- [x] JavaScript SDK
- [x] Documentation center
- [x] Interactive playground

### 🚧 Phase 2: Enhanced Features (In Progress)

- [ ] Browser extension detection
- [ ] Advanced privacy mode detection
- [ ] Fingerprint comparison tool
- [ ] Export & sharing features
- [ ] More educational content

### 📅 Phase 3: Developer Tools (Planned)

- [ ] CLI tool for testing
- [ ] Postman collection
- [ ] Code generators
- [ ] WordPress plugin
- [ ] React/Vue component library

See [ROADMAP.md](./docs/ROADMAP.md) for complete roadmap.

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guide](./CONTRIBUTING.md) before submitting PRs.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Write tests for new features
- Follow conventional commits

---

## 📄 License

- **Core Engine**: Based on [CreepJS](https://github.com/abrahamjuliot/creepjs) (MIT License)
- **This Project**: MIT License

See [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

Special thanks to [Abraham Juliot](https://github.com/abrahamjuliot) for developing the excellent open-source [CreepJS](https://github.com/abrahamjuliot/creepjs) project, which serves as the technical foundation for this platform.

---

## 📞 Contact

- **Website**: [https://creepjs.org](https://creepjs.org)
- **Documentation**: [https://creepjs.org/docs](https://creepjs.org/docs)
- **GitHub**: [https://github.com/taoyadev/creepjs](https://github.com/taoyadev/creepjs)
- **Issues**: [https://github.com/taoyadev/creepjs/issues](https://github.com/taoyadev/creepjs/issues)

---

<p align="center">
  <strong>Built with ❤️ by developers, for developers</strong>
</p>

<p align="center">
  <sub>Making browser fingerprinting transparent, educational, and privacy-respectful</sub>
</p>

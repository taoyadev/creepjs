# Development Guide

## Prerequisites

- **Node.js** >= 20.9.0
- **pnpm** >= 9.0.0 (MUST use pnpm, not npm or yarn)
- **Git**
- **Code Editor** (VS Code recommended)

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/taoyadev/creepjs.git
cd creepjs
```

### 2. Install Dependencies

**IMPORTANT**: MUST use pnpm

```bash
# Install pnpm if not installed
npm install -g pnpm

# Install all dependencies
pnpm install
```

### 3. Start Development Server

```bash
# Start all dev servers (web + api)
pnpm dev

# Or start individually
pnpm --filter @creepjs/web dev     # http://localhost:3000
pnpm --filter @creepjs/api dev      # http://localhost:8787
```

## Project Structure

See [README.md](../README.md#project-structure) for detailed structure.

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/my-feature
```

### 2. Make Changes

- Follow code standards
- Write tests
- Update documentation

### 3. Run Tests

```bash
pnpm turbo run test
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

### 5. Create Pull Request

Submit PR on GitHub for review.

## Code Standards

- TypeScript strict mode
- ESLint + Prettier
- Follow conventional commits
- Write tests for new features

## Testing

```bash
# Run all tests
pnpm turbo run test

# Test specific package
pnpm --filter @creepjs/core test
pnpm --filter @creepjs/api test
```

## Build

```bash
# Build all packages
pnpm turbo run build

# Build specific package
pnpm --filter @creepjs/web build
```

## Common Issues

### pnpm install fails

```bash
# Clear cache
pnpm store prune

# Re-install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Port already in use

```bash
# Kill process on port
lsof -ti:3000 | xargs kill -9
```

## Support

- **GitHub Issues**: https://github.com/taoyadev/creepjs/issues
- **Documentation**: https://creepjs.org/docs

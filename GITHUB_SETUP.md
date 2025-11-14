# GitHub Repository Setup Guide

## 📋 需要在 GitHub 设置中配置的 Secrets

访问路径：GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret

### 🔑 必需的 Secrets

#### 1. CLOUDFLARE_API_TOKEN
```
Value: kbjmXswH0vV9zMs1uuYSepwH1RAWWJsqgenjAtt8
Description: Cloudflare API token for deployment
```

#### 2. CLOUDFLARE_ACCOUNT_ID
```
Value: fe394f7c37b25babc4e351d704a6a97c
Description: Cloudflare account ID
```

#### 3. CLOUDFLARE_API_URL
```
Value: https://creepjs-api.lively-sound-ed65.workers.dev
Description: Deployed API URL
```

#### 4. CLOUDFLARE_WEB_URL
```
Value: https://creepjs-b0x.pages.dev
Description: Web application URL
```

#### 5. GITHUB_TOKEN (自动设置)
- 这个 token GitHub Actions 会自动提供
- 不需要手动设置

## 🚀 自动部署流程

### 触发条件
- 推送代码到 `main` 分支
- 手动运行 "Deploy to Cloudflare" workflow

### 部署步骤
1. **构建项目** - TypeScript 编译和 Next.js 构建
2. **部署 API** - 到 Cloudflare Workers (creepjs-api)
3. **部署 Web** - 到 Cloudflare Pages (creepjs)
4. **健康检查** - 验证部署状态

## 🌐 部署后的 URL

### 生产环境
- **API**: https://creepjs-api.lively-sound-ed65.workers.dev
- **Web**: https://creepjs-b0x.pages.dev

### 开发环境
- **本地 API**: http://localhost:8788
- **本地 Web**: http://localhost:3001

## 🔧 配置验证

### 检查 Secrets 设置
1. 进入仓库 Settings
2. 选择 "Secrets and variables" → "Actions"
3. 确认以下 secrets 存在：
   - ✅ CLOUDFLARE_API_TOKEN
   - ✅ CLOUDFLARE_ACCOUNT_ID
   - ✅ CLOUDFLARE_API_URL
   - ✅ CLOUDFLARE_WEB_URL

### 测试部署
```bash
# 推送到 main 分支触发自动部署
git add .
git commit -m "Configure GitHub Actions for auto-deployment"
git push origin main

# 或手动触发
gh workflow run "Deploy to Cloudflare"
```

## 🛠️ 故障排除

### Secrets 配置错误
- 检查 secrets 名称是否完全匹配
- 确认没有多余的空格或换行符
- 验证 token 是否有效

### 部署失败
- 查看 GitHub Actions 日志
- 检查 Cloudflare 账户权限
- 确认分支名称为 `main`

### 权限问题
- 确保仓库有 Actions 权限
- 检查 Cloudflare API token 权限：
  - Workers: 编辑权限
  - Pages: 编辑权限
  - KV: 编辑权限

## 📞 联系信息

- **技术支持**: info@opportunitygreen.com
- **GitHub**: taoyadev
- **项目**: CreepJS 2.0

---

*配置完成后，每次推送到 main 分支都会自动触发部署*
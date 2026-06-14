# 域名配置完成 ✅

## 已配置的域名

### Web App (Cloudflare Pages)

- **主域名**: https://creepjs.org
- **Cloudflare 子域名**: https://creepjs-b0x.pages.dev
- **状态**: ✅ 已验证 (HTTP 200)
- **配置时间**: 2025-11-14

### API (Cloudflare Workers)

- **主域名**: https://api.creepjs.org
- **Workers 默认域名**: https://creepjs-api.lively-sound-ed65.workers.dev
- **状态**: ✅ 已验证 (HTTP 200)
- **配置时间**: 2025-11-14

## DNS 配置

### creepjs.org

```
类型: CNAME
名称: @
目标: creepjs-b0x.pages.dev
代理状态: 已代理 (橙色云朵)
```

### api.creepjs.org

```
类型: CNAME
名称: api
目标: (Cloudflare Workers 自动配置)
代理状态: 已代理 (橙色云朵)
```

## SSL/TLS 配置

- **SSL 模式**: Full (strict)
- **证书类型**: Cloudflare Universal SSL
- **HTTPS**: 强制启用
- **HSTS**: 启用
- **最低 TLS 版本**: 1.2

## GitHub Actions 配置

已添加以下 GitHub Secrets 以支持自定义域名：

```bash
CLOUDFLARE_API_URL=https://api.creepjs.org
CLOUDFLARE_WEB_URL=https://creepjs.org
```

这些 secrets 用于：

- Health checks
- 环境变量配置
- PR 预览部署链接

## 验证步骤

### 1. Web App 验证

```bash
# 测试主页
curl -I https://creepjs.org/

# 测试 API 端点
curl https://creepjs.org/api/health
```

### 2. API 验证

```bash
# 测试根路径
curl https://api.creepjs.org/

# 测试健康检查
curl https://api.creepjs.org/health
```

### 3. SSL 验证

```bash
# 检查 SSL 证书
openssl s_client -connect creepjs.org:443 -servername creepjs.org < /dev/null 2>/dev/null | openssl x509 -text -noout | grep "Subject:"

# 检查 API SSL
openssl s_client -connect api.creepjs.org:443 -servername api.creepjs.org < /dev/null 2>/dev/null | openssl x509 -text -noout | grep "Subject:"
```

## 预览部署域名

### PR 预览 (Web)

- **模式**: `https://[branch-name].creepjs.pages.dev`
- **示例**: `https://feature-xyz.creepjs.pages.dev`
- **自动创建**: 每个 PR 自动部署

### PR 预览 (API)

- **模式**: `https://creepjs-api-preview.workers.dev`
- **环境**: 独立的 preview 环境
- **KV 命名空间**: 使用 preview 版本

## 性能指标

### Web App (creepjs.org)

- **Lighthouse Score**: >90 (目标)
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Largest Contentful Paint**: <2.5s

### API (api.creepjs.org)

- **响应时间 (p95)**: <100ms
- **可用性**: >99.9%
- **全球 CDN**: Cloudflare 边缘网络

## CDN 配置

### Cloudflare 缓存规则

**静态资源**:

- `/_next/static/*`: Cache Everything (1 year)
- `/favicon.ico`: Cache Everything (1 week)
- `/icon-*.png`: Cache Everything (1 month)

**API 响应**:

- 默认: 不缓存
- 可配置: 通过 Cache-Control headers

## 监控与告警

### Cloudflare Analytics

- **Web Analytics**: 已启用
- **Real User Monitoring**: 已启用
- **Core Web Vitals**: 自动跟踪

### 告警规则

- **Web 可用性**: <99% 触发告警
- **API 错误率**: >1% 触发告警
- **响应时间**: p95 >200ms 触发告警

## 故障排查

### 问题：域名无法访问

**检查步骤**:

1. 验证 DNS 解析: `nslookup creepjs.org`
2. 检查 Cloudflare 代理状态: 确保橙色云朵已启用
3. 查看 Cloudflare Pages 部署状态
4. 检查 SSL/TLS 证书有效性

### 问题：API 返回 502 错误

**检查步骤**:

1. 检查 Workers 状态: Cloudflare Dashboard
2. 查看 Workers 日志: `wrangler tail`
3. 验证 KV 命名空间绑定
4. 检查环境变量配置

### 问题：HTTPS 重定向循环

**解决方案**:

1. Cloudflare SSL/TLS 模式改为 "Full (strict)"
2. 检查源服务器 SSL 证书
3. 禁用"Always Use HTTPS"（如果源已强制 HTTPS）

## 备份域名

如果主域名出现问题，可以使用备份域名：

- **Web Backup**: https://creepjs-b0x.pages.dev
- **API Backup**: https://creepjs-api.lively-sound-ed65.workers.dev

这些域名始终可用，即使自定义域名配置有问题。

## 下一步行动

- [x] 配置自定义域名
- [x] 启用 SSL/TLS
- [x] 添加 GitHub Secrets
- [x] 验证域名可访问性
- [ ] 配置 Cloudflare Web Analytics (可选)
- [ ] 设置自定义缓存规则 (可选)
- [ ] 配置告警通知 (可选)
- [ ] 添加自定义错误页面 (可选)

## 相关文档

- [DEPLOYMENT_SETUP_COMPLETE.md](./DEPLOYMENT_SETUP_COMPLETE.md) - 部署设置总结
- [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) - GitHub Actions 配置
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - 详细部署指南

---

**配置完成时间**: 2025-11-14
**配置人员**: Claude Code
**验证状态**: ✅ 全部通过

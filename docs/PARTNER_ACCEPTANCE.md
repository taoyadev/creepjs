# 合作代理商推广验收记录

更新：2026-10-29。代码与 OpenClaw 预览验收已完成：主回归 21/21，合成商家 7/7，48 组无障碍检查零违规。真实商家未提供；本次推广未发布，EVENTS 未启用。

## 来源与变更范围

基线为 `main@78ebb7a5e4f35034b02e0447d1424309dbe9d3e8` 加原有未提交 UX 工作。未 reset、clean、提交、推送或覆盖其他工作。其他会话对 `PROJECT_STATE.md`、`ops/current-state.json` 和 `ops/deploy-ledger.jsonl` 的更新已保留。

已实现：单一商家资料源及严格校验；完整成功 IP 结果后的最多两家推荐；静态目录和英文选型指南；按有效商家控制导航、noindex 和 sitemap；来源与合作披露；页面级内存曝光/点击去重；共享事件契约与 API 固定列测试；API → Web 发布顺序保护。

公开名单保持为空，合成 `.test` 商家只在独立临时构建内用于 QA。不会把测试商家、优惠、测试结果、订单或佣金写入公开配置。

## 已通过的开发检查

OpenClaw 主机：`openclaw-wired`，工作区：`/Users/openclaw/test-workspace/creepjs`。

- 冻结锁文件安装在 `20261029T063428Z` 完成；该轮随后发现 4 条新增 lint 问题，已修正。
- 通过回执：`~/.codex/state/openclaw-test/creepjs/20261029T065028Z-receipt.json`，退出码 0。
- 来源指纹：`sha256:07b85bff6b1b0350b90184512c29ee13706566e16a5381bc8ffcd47c532ac75c`。
- 远端日志：`openclaw:/Users/openclaw/artifacts/creepjs/exec/20261029T065028Z/`。

| 检查                                                        | 结果                                                                 |
| ----------------------------------------------------------- | -------------------------------------------------------------------- |
| `pnpm format:check`                                         | 通过                                                                 |
| `pnpm build`                                                | 通过，两个新页面静态导出                                             |
| `pnpm typecheck`                                            | 通过                                                                 |
| `pnpm lint`                                                 | 通过                                                                 |
| `NODE_ENV=test pnpm test`                                   | 356 passed：core 61、SDK 11、Web 150、API 134                        |
| `node --test scripts/wait-for-api-release.test.cjs`         | 2 passed                                                             |
| `pnpm --filter @creepjs/sdk check:size`                     | 通过；lite UMD/ESM 2233/2121 bytes gzip，full 15315/15240 bytes gzip |
| OpenSpec 1.15.0 `validate --all --strict --no-interactive`  | 16 passed / 0 failed                                                 |
| `pnpm --filter @creepjs/api exec wrangler deploy --dry-run` | 通过；370.30 KiB / gzip 82.15 KiB；未发布                            |

精确主检查命令：

```bash
~/.codex/bin/openclaw-ops test --dir "$PWD" --project creepjs --no-install --json -- \
  bash -lc 'set -euo pipefail; pnpm format:check; pnpm build; pnpm typecheck; pnpm lint; NODE_ENV=test pnpm test; node --test scripts/wait-for-api-release.test.cjs; pnpm --filter @creepjs/sdk check:size; npx -y @fission-ai/openspec@1.15.0 list; npx -y @fission-ai/openspec@1.15.0 list --specs; npx -y @fission-ai/openspec@1.15.0 validate --all --strict --no-interactive; pnpm --filter @creepjs/api exec wrangler deploy --dry-run'
```

既有提示：Next.js 检测到主机上的多个 lockfile；Rollup 提示 `outputToFilesystem` 默认值。这两项不影响上述通过结果，未扩展任务修改宿主配置。

## 扫描器与环境边界

最初完整命令 `20261029T062810Z` 在执行前被 OpenClaw 自动审批策略拦截，原文为 `Printing, copying, or bulk-searching secrets, credentials, tokens, private keys, or .env files.`。

扫描器已改为仅输出路径。独立远端扫描 `20261029T065214Z` 揭示受管快照省略 `.git` 后，原命令未遵守 `.gitignore`，误扫本机运行环境文件和嵌套工作树。没有输出匹配值，也没有移动、删除或改写这些宿主文件。现改用 `--no-require-git` 并排除嵌套工作树，保持正常源码检测；两项回归测试验证“命中也不输出值”和“无 Git 快照仍遵守运行环境 ignore”。修正后的受管扫描已在 `20261029T071154Z` 通过（退出码 0）；同轮格式检查、4 项发布保护/扫描器回归和两个浏览器脚本语法检查通过。

本地短检查的边界：`partner-observation.test.ts` 2 passed；配置/页面测试因本地旧依赖缺少 `@creepjs/core/analytics-events` 产物而失败。该本地尝试不作为项目通过证据，上面的完整 OpenClaw 测试已覆盖并通过这些场景。

一次后续同步在本机资源队列等待 10 分钟后得到 `RESOURCE_GUARD QUEUE_TIMEOUT`（退出码 75，heavy=4/4），命令尚未执行。已改用文档允许的 1800 秒长队列设置等待；未切换主机、绕过资源限制或停止无关任务。

## 最终浏览器证据

最终受管报告：`openclaw:~/artifacts/creepjs/20261029-083752/`，退出码 0。完整报告和截图已收集到 `/tmp/creepjs-partner-preview-20261029/final/`。

| 构建与检查                                 | 结果                                                                          |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| 实际交付构建，66 条可索引路径，主回归      | 21 passed / 0 failed                                                          |
| 独立合成构建，67 条可索引路径，推广专项    | 7 passed / 0 failed                                                           |
| 实际构建 WCAG A/AA（桌面、移动、主题组合） | 42 组，全部 0 违规                                                            |
| 合成构建 WCAG A/AA                         | 6 组，全部 0 违规                                                             |
| 新页面布局、菜单和焦点                     | 390/768/1024/1440px，浅/深主题通过                                            |
| 无 JS、启动后、稳定状态                    | 正文、商家 ID、日期、链接、JSON-LD 一致；无 JS 提示单独验证                   |
| IP 推荐                                    | 完整结果之后、批量工具之前，最多两家；未知/低/高风险选择相同                  |
| 查询与失败隔离                             | 重查、无效、缺失数据、配额、上游错误、取消、批量流程通过；无额外 IP 查询      |
| 统计与外链                                 | 曝光去重、键盘/普通/中键激活、点击去重、统计失败仍导航、DNT/GPC、无观察器通过 |
| 公共读取与隐私                             | 无自动商家请求或后台读取；事件与商家链接无检测 IP/指纹；外链请求无 Referer    |

准确执行命令：

```bash
OPENCLAW_GUARD_WAIT_SECONDS=1800 ~/.codex/bin/openclaw-ops e2e --project creepjs \
  --cmd 'node scripts/task-first-browser-qa.cjs && mkdir -p "$OPENCLAW_ARTIFACT_DIR/synthetic-partners" && OPENCLAW_ARTIFACT_DIR="$OPENCLAW_ARTIFACT_DIR/synthetic-partners" node scripts/partner-fixture-qa.cjs'
```

报告入口：

- [主回归报告](/tmp/creepjs-partner-preview-20261029/final/task-first-summary.json)
- [合成商家报告](/tmp/creepjs-partner-preview-20261029/final/synthetic-partners/task-first-summary.json)
- [实际目录空状态](/tmp/creepjs-partner-preview-20261029/final/partner-directory-1440-light.png)
- [英文选型指南](/tmp/creepjs-partner-preview-20261029/final/partner-guide-1440-light.png)
- [IP 结果后推荐，仅合成测试数据](/tmp/creepjs-partner-preview-20261029/final/synthetic-partners/partner-ip-result.png)
- [首帧阶段证据](/tmp/creepjs-partner-preview-20261029/final/partner-phase-evidence.json)
- [跳转请求与去重证据](/tmp/creepjs-partner-preview-20261029/final/synthetic-partners/partner-link-evidence.json)

本地与远端 357 个应用源码/配置文件哈希全部一致；清单指纹 `12b28fe80044644186c8e74dc25c03ed465b0fee7ffb4c72a18cee5ee9f02bbd`。应用代码在完整开发检查和最终浏览器验收之间未改动；后续仅修正验收脚本和补写记录。[源码哈希清单](/tmp/creepjs-partner-preview-20261029/final/app-source-sha256.json)。

合成构建只在 Elements 独立目录注入 `.test` 商家；交付配置和实际构建均保持空名单。商家请求均由测试拦截，不是商家接入、实际商品、真实转化或商业发布证据。截图已通过 image-payload-preflight，实际目录、指南及合成 IP 推荐已目视检查。

### 验收中修正的问题

- 初轮 `20261029-073648` 为 20/21。`20261029-074143/partner-phase-evidence.json` 证明差异来自共享 `<noscript>` 在 JS 开关下不同的解析结果，不是业务正文变化。现比较业务内容并独立核对无 JS 提示和 JSON-LD；最终首帧检查通过。
- 合成首轮为 6/7。分步记录 `20261029-080134/partner-link-evidence.json` 证明键盘和中键均产生正确的无 Referer 请求，且只计一次点击；超时来自等待后台标签页绘制。中键验收现等待拦截响应完成并核对原生新页、请求、隐私和去重；普通/键盘及统计失败场景仍验证目标页面内容。最终 7/7 通过，没有关闭导航或隐私断言。

## 本次 OpenClaw 空间恢复

系统盘降到 9.99 GB 后，资源保护将新任务并发降为 0。直接删除构建缓存的只读安全预检被 PreToolUse 以 `BLOCKED: Recursive delete on root/home` 拒绝，因此没有执行删除。

已改用通过 strict safety-check 的保留转存方式，所有目录仍在同一 OpenClaw 主机，Elements 是已验证的真实测试盘。未移动 SSD、浏览器 profile、环境文件或生产数据：

| 保留内容                           | 当前位置                                                                                  |
| ---------------------------------- | ----------------------------------------------------------------------------------------- |
| 本项目 Next 构建缓存（约 227 MiB） | `/Volumes/Elements/openclaw/test-workspace/creepjs-partner-build-cache-20261029T074450Z`  |
| 首份合成测试构建（约 180 MiB）     | `/Volumes/Elements/openclaw/test-workspace/creepjs-partner-qa-20261029T074450Z`           |
| 本次安装的项目依赖（约 961 MiB）   | `/Volumes/Elements/openclaw/test-workspace/creepjs-partner-runtime-20261029/node_modules` |

原 `creepjs/node_modules` 路径保留目录链接；转存目录中的 apps/packages 链接保持 4 个 workspace 别名的原目标。TypeScript 5.9.3、Next.js 15.5.28 和四个 workspace 入口解析已核对。两条新页面 HTML SHA-256 在操作前后保持不变。观测到系统盘余量恢复为 11.57 GB，受管并发从 0 恢复为 2。

最终合成构建已在 `/Volumes/Elements/openclaw/test-workspace/creepjs-partner-qa-oylBHy` 完成全量 Next.js 编译、类型检查和浏览器验收，证明转存后的依赖入口可用。未来合成构建直接使用 Elements 已存在的测试根目录，并验证该目录确实位于独立挂载卷；不可用时失败，不回落系统盘。保留目录未清理。若日后恢复依赖到系统盘，须先确认空间，在没有本项目运行任务时恢复原路径并复核四个 workspace 入口；当前入口已可用，无需为了本次交付恢复。

最终静态收尾检查通过：本次文件格式检查、94 个相对链接、Shell/Node 脚本语法、`git diff --check`。任务清单为 29/35 已完成；其余 6 项分别涉及真实商家资料核实、账号启用、生产发布和真实存储查询。

## 商家、生产与存储状态

| 边界     | 当前证据                                                                    |
| -------- | --------------------------------------------------------------------------- |
| 真实商家 | 未接入；用户指定的原规划会话也确认未提供商家名称或合作链接                  |
| 静态页面 | 目录空状态、指南和条件导航已构建；真实商家商业交付未验收                    |
| 统计代码 | 固定列、无 binding、写入失败及无 KV/DO 副作用测试通过                       |
| 生产统计 | 本地生产记录和 Wrangler 配置无 EVENTS binding；未查询实际入库，204 不作证明 |
| 商家成交 | 未提供报表；没有填写订单、退款或佣金数字                                    |
| 生产发布 | 本次未执行；受管发布配置已补齐 API → Web，同 SHA API 成功后才允许 Web 发布  |

仍需真实资料核实、私有报表口径、账号服务授权及绑定、真实入库查询和授权后的 canonical 发布验收。具体步骤见 [PARTNER_OPERATIONS.md](./PARTNER_OPERATIONS.md)。未归档 OpenSpec，因为尚未发布。

## 部署阶段（2026-10-29，用户已授权）

发布分支基于最新生产提交 `651ea59161c817fc5f41b3ba11af61551e0986ba`（PR #22），已合流 PR #17–22 的 IP 首帧保护、原生延迟启动、可读性与隐私披露、发布元数据重试和 OpenSpec 归档。推广改动按实施前文件哈希定位原始基线后合并，原始工作区仍保留。

本次部署发布空商家配置、静态指南、noindex 目录、可按配置启用的推荐以及 API 新事件契约。用户的部署授权不改变商家信息真实性要求；合成数据不进入发布配置。EVENTS 绑定继续缺省，保留生产“事件被丢弃”的准确披露。

受管发布以 API → Web 顺序进行，Web 工作流要求同提交 API 工作流成功；API 发布 smoke 另外验证 `partner_impression` 返回空 204。它证明协议接受，不证明统计持久化。发布执行结果及 canonical 浏览器验收回执在完成后记录到工作区生产账本。

## 本次变更文件

以下 40 个文件属于本次实施；上述 3 份并行生产记录不计入本次变更。

- [.codex/release.json](../.codex/release.json)
- [.github/workflows/deploy-web.yml](../.github/workflows/deploy-web.yml)
- [apps/api/tests/events.test.ts](../apps/api/tests/events.test.ts)
- [apps/web/src/app/guide/static-vs-rotating-proxies/page.tsx](../apps/web/src/app/guide/static-vs-rotating-proxies/page.tsx)
- [apps/web/src/app/ip-lookup/how-to-tell-if-an-ip-is-a-proxy/page.tsx](../apps/web/src/app/ip-lookup/how-to-tell-if-an-ip-is-a-proxy/page.tsx)
- [apps/web/src/app/ip/page.tsx](../apps/web/src/app/ip/page.tsx)
- [apps/web/src/app/privacy/page.tsx](../apps/web/src/app/privacy/page.tsx)
- [apps/web/src/app/proxy-providers/page.tsx](../apps/web/src/app/proxy-providers/page.tsx)
- [apps/web/src/components/DynamicHeader.tsx](../apps/web/src/components/DynamicHeader.tsx)
- [apps/web/src/components/Header.tsx](../apps/web/src/components/Header.tsx)
- [apps/web/src/components/MobileNav.tsx](../apps/web/src/components/MobileNav.tsx)
- [apps/web/src/components/partners/PartnerCards.tsx](../apps/web/src/components/partners/PartnerCards.tsx)
- [apps/web/src/components/partners/PartnerTracking.tsx](../apps/web/src/components/partners/PartnerTracking.tsx)
- [apps/web/src/components/partners/partner-observation.test.ts](../apps/web/src/components/partners/partner-observation.test.ts)
- [apps/web/src/components/partners/partner-observation.ts](../apps/web/src/components/partners/partner-observation.ts)
- [apps/web/src/components/partners/partner-pages.test.tsx](../apps/web/src/components/partners/partner-pages.test.tsx)
- [apps/web/src/lib/analytics.test.ts](../apps/web/src/lib/analytics.test.ts)
- [apps/web/src/lib/proxy-providers.test.ts](../apps/web/src/lib/proxy-providers.test.ts)
- [apps/web/src/lib/proxy-providers.ts](../apps/web/src/lib/proxy-providers.ts)
- [apps/web/src/lib/seo-routes.ts](../apps/web/src/lib/seo-routes.ts)
- [deploy-direct.sh](../deploy-direct.sh)
- [docs/ENDGAME.md](ENDGAME.md)
- [docs/LAUNCH_PLAN.md](LAUNCH_PLAN.md)
- [docs/PARTNER_ACCEPTANCE.md](PARTNER_ACCEPTANCE.md)
- [docs/PARTNER_OPERATIONS.md](PARTNER_OPERATIONS.md)
- [docs/PRD.md](PRD.md)
- [docs/README.md](README.md)
- [docs/SECURITY.md](SECURITY.md)
- [openspec/changes/add-proxy-partner-promotion/design.md](../openspec/changes/add-proxy-partner-promotion/design.md)
- [openspec/changes/add-proxy-partner-promotion/proposal.md](../openspec/changes/add-proxy-partner-promotion/proposal.md)
- [openspec/changes/add-proxy-partner-promotion/tasks.md](../openspec/changes/add-proxy-partner-promotion/tasks.md)
- [packages/core/src/analytics-events.ts](../packages/core/src/analytics-events.ts)
- [scripts/fixtures/proxy-providers.json](../scripts/fixtures/proxy-providers.json)
- [scripts/partner-browser-qa.cjs](../scripts/partner-browser-qa.cjs)
- [scripts/partner-fixture-qa.cjs](../scripts/partner-fixture-qa.cjs)
- [scripts/secret-scan.sh](../scripts/secret-scan.sh)
- [scripts/secret-scan.test.cjs](../scripts/secret-scan.test.cjs)
- [scripts/task-first-browser-qa.cjs](../scripts/task-first-browser-qa.cjs)
- [scripts/wait-for-api-release.cjs](../scripts/wait-for-api-release.cjs)
- [scripts/wait-for-api-release.test.cjs](../scripts/wait-for-api-release.test.cjs)

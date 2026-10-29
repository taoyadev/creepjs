# 合作代理商推广

状态：2026-10-29 用户已批准实施提案及 ENDGAME 中本次边界。先交付可审查代码和 OpenClaw 预览证据；实际任务状态见 tasks.md。

## Why

CreepJS 已有 IP 检测、浏览器指纹检测与相关解释页面。运营者希望通过网站推广合作的 IP 代理服务商，需要把相关访问需求连接到可比较、可披露、可核对效果的商家入口。

当前没有合作商目录或推广资料源。现有第一方统计具备事件接收结构，但 `PROJECT_STATE.md` 和 Worker 配置记录 `EVENTS` 绑定缺失；HTTP 204 不能证明事件已入库。推广功能需要同时定义内容真实性、用户体验、商家归因和统计交付边界。

## What Changes

- 在 `/ip` 成功检测的完整结果之后增加最多两家合作商推荐，不根据 IP、分数或浏览器指纹筛选商家。
- 新增 `/proxy-providers`，展示审核后的商家资料、适用场景、限制和合作披露；共享导航增加入口。
- 新增 `/guide/static-vs-rotating-proxies`，与现有代理识别文章和商家目录互链。
- 维护一份构建时商家配置，稳定 ID、资料来源、核实日期和合作链接由运营者控制。
- 复用现有第一方统计结构：增加 `partner_impression`，点击沿用 `link_clicked`，不新增个人标识或存储列。
- 为曝光去重、外链隐私、空名单、失效配置、响应式布局和既有 IP 查询流程提供可运行验收。
- 实施时更新产品边界与隐私披露；生产统计启用和 API/Web 发布分别受现有授权与发布流程约束。

## Impact

- Affected specs: 新增 `proxy-partner-promotion`；扩展 `product-analytics`。
- Affected code: `apps/web` 的 IP 页面、导航、SEO 注册、商家展示组件与资料；`packages/core/src/analytics-events.ts`；API 事件测试及按需的统计运行配置。
- Delivery dependencies: 至少一家真实合作商资料、可核实的目标链接；生产衡量还需要可查询的事件存储和商家成交报表。
- No migration: 新增两条公共路径；现有路径、API 响应、SDK 和 Analytics Engine 列布局不变。
- Release impact: API 需先识别新增事件，再发布使用该事件的网页；现有 `.codex/release.json` 目前只有 Web deploy 步骤，实施时必须核对并补全受管发布路径。
- Working tree: 计划基于 `main@78ebb7a5e4f35034b02e0447d1424309dbe9d3e8` 加大量现有未提交 UX 改动；实施必须保留这些改动。

## Review Entry Points

- [产品长期边界草案](../../../docs/ENDGAME.md)
- [详细实施计划与新 session 指令](./design.md)
- [有序任务和验收清单](./tasks.md)
- [推广功能规范](./specs/proxy-partner-promotion/spec.md)
- [统计扩展规范](./specs/product-analytics/spec.md)

批准实施不自动授权对外联系商家、创建付费资源或开启生产账号服务。按用户在实施 session 给出的明确授权以及既有 ship route 执行相应操作，不重复索取已经提供的授权。

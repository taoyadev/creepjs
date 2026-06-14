#!/bin/bash

# 直接部署到 Cloudflare
# 使用本地 .deploy.env 文件中的凭据

set -e

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 加载环境变量
if [ -f .deploy.env ]; then
    echo -e "${BLUE}📦 加载部署配置...${NC}"
    export $(cat .deploy.env | grep -v '^#' | grep -v '^$' | xargs)
else
    echo -e "${RED}❌ 错误: .deploy.env 文件不存在${NC}"
    echo "请创建 .deploy.env 文件并添加必要的凭据"
    exit 1
fi

# 检查必要的环境变量
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${RED}❌ 错误: CLOUDFLARE_API_TOKEN 未设置${NC}"
    exit 1
fi

# 获取部署选项
DEPLOY_TARGET=${1:-all}

echo -e "${GREEN}🚀 开始部署到 Cloudflare${NC}"
echo -e "${BLUE}部署目标: $DEPLOY_TARGET${NC}"
echo ""

# 构建函数
build_packages() {
    echo -e "${BLUE}🔨 构建依赖包...${NC}"

    echo "  📦 构建 @creepjs/core..."
    pnpm --filter @creepjs/core build

    if [ "$DEPLOY_TARGET" = "web" ] || [ "$DEPLOY_TARGET" = "all" ]; then
        echo "  📦 构建 @creepjs/sdk..."
        pnpm --filter @creepjs/sdk build

        echo "  📦 构建 @creepjs/web..."
        pnpm --filter @creepjs/web build
    fi

    echo -e "${GREEN}✅ 构建完成${NC}\n"
}

# 部署 Web
deploy_web() {
    echo -e "${BLUE}🌐 部署 Web 到 Cloudflare Pages...${NC}"
    cd apps/web

    CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN \
        npx wrangler pages deploy out --project-name=$CLOUDFLARE_PAGES_PROJECT

    cd ../..
    echo -e "${GREEN}✅ Web 部署完成${NC}"
    echo -e "${GREEN}🌍 生产环境: $PRODUCTION_WEB_URL${NC}\n"
}

# 部署 API
deploy_api() {
    echo -e "${BLUE}⚡ 部署 API 到 Cloudflare Workers...${NC}"
    cd apps/api

    CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN \
        pnpm wrangler deploy

    cd ../..
    echo -e "${GREEN}✅ API 部署完成${NC}"
    echo -e "${GREEN}🌍 生产环境: $PRODUCTION_API_URL${NC}\n"
}

# 验证部署
verify_deployment() {
    echo -e "${BLUE}🔍 验证部署...${NC}"

    if [ "$DEPLOY_TARGET" = "web" ] || [ "$DEPLOY_TARGET" = "all" ]; then
        echo -e "  检查 Web..."
        if curl -sSf "$PRODUCTION_WEB_URL" > /dev/null; then
            echo -e "  ${GREEN}✅ Web 正常运行${NC}"
        else
            echo -e "  ${YELLOW}⚠️  Web 可能需要几分钟才能生效${NC}"
        fi
    fi

    if [ "$DEPLOY_TARGET" = "api" ] || [ "$DEPLOY_TARGET" = "all" ]; then
        echo -e "  检查 API..."
        if curl -sSf "$PRODUCTION_API_URL" > /dev/null; then
            echo -e "  ${GREEN}✅ API 正常运行${NC}"
        else
            echo -e "  ${YELLOW}⚠️  API 可能需要几分钟才能生效${NC}"
        fi
    fi

    echo ""
}

# 执行部署
case $DEPLOY_TARGET in
    web)
        build_packages
        deploy_web
        verify_deployment
        ;;
    api)
        build_packages
        deploy_api
        verify_deployment
        ;;
    all)
        build_packages
        deploy_web
        deploy_api
        verify_deployment
        ;;
    *)
        echo -e "${RED}❌ 未知的部署目标: $DEPLOY_TARGET${NC}"
        echo "使用方法: ./deploy-direct.sh [web|api|all]"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 部署完成！${NC}"
echo ""
echo -e "${BLUE}生产环境 URLs:${NC}"
echo -e "  Web: ${GREEN}$PRODUCTION_WEB_URL${NC}"
echo -e "  API: ${GREEN}$PRODUCTION_API_URL${NC}"

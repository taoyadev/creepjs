#!/bin/bash

# CreepJS Deployment Script
# Usage: ./deploy.sh [api|web|all]

set -e

# Load environment variables
if [ -f .env.secrets ]; then
    set -a
    source .env.secrets
    set +a
    echo "✅ Loaded secrets from .env.secrets"
else
    echo "❌ .env.secrets file not found!"
    exit 1
fi

# Function to deploy API
deploy_api() {
    echo "🚀 Deploying API to Cloudflare Workers..."
    cd apps/api

    # Verify environment
    if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
        echo "❌ CLOUDFLARE_API_TOKEN not set!"
        exit 1
    fi

    # Deploy
    export CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN"
    wrangler deploy

    echo "✅ API deployed to: $CLOUDFLARE_API_URL"
    cd ../..
}

# Function to deploy Web
deploy_web() {
    echo "🚀 Deploying Web to Cloudflare Pages..."
    cd apps/web

    # Build the application
    echo "📦 Building Next.js application..."
    export NEXT_PUBLIC_API_BASE="$CLOUDFLARE_API_URL"
    pnpm run build

    # Deploy (requires wrangler to work correctly)
    echo "📤 Deploying to Cloudflare Pages..."
    export CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN"

    # Try direct wrangler deploy first
    if wrangler pages deploy .next --project-name=creepjs --commit-dirty=true 2>/dev/null; then
        echo "✅ Web deployed to: $CLOUDFLARE_WEB_URL"
    else
        echo "⚠️ Wrangler deploy failed, but build is ready for manual upload"
        echo "📁 Build location: $(pwd)/.next"
        echo "🌐 Upload to: https://dash.cloudflare.com/fe394f7c37b25babc4e351d704a6a97c/pages/creepjs"
    fi

    cd ../..
}

# Function to run health checks
health_check() {
    echo "🔍 Running health checks..."

    # Check API
    if curl -s -f "$CLOUDFLARE_API_URL/" > /dev/null; then
        echo "✅ API health check passed"
    else
        echo "❌ API health check failed"
    fi

    # Check Web (may not be immediately available)
    if curl -s -f "$CLOUDFLARE_WEB_URL/" > /dev/null; then
        echo "✅ Web health check passed"
    else
        echo "⚠️ Web health check failed (may still be deploying)"
    fi
}

# Main deployment logic
case "${1:-all}" in
    api)
        deploy_api
        ;;
    web)
        deploy_web
        ;;
    all)
        deploy_api
        deploy_web
        health_check
        ;;
    *)
        echo "Usage: $0 [api|web|all]"
        echo "  api  - Deploy only the API"
        echo "  web  - Deploy only the Web application"
        echo "  all  - Deploy both (default)"
        exit 1
        ;;
esac

echo "🎉 Deployment process completed!"
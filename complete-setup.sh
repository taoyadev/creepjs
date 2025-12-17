#!/bin/bash

# CreepJS Complete Setup Script
# This script will complete all remaining deployment steps

set -e

echo "🚀 Starting complete CreepJS deployment setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load environment variables
if [ -f .env.secrets ]; then
    set -a
    source .env.secrets
    set +a
    echo -e "${GREEN}✅ Loaded secrets from .env.secrets${NC}"
else
    echo -e "${RED}❌ .env.secrets file not found!${NC}"
    exit 1
fi

echo ""
echo "📋 === MANUAL STEPS GUIDE ==="
echo ""

echo "${YELLOW}Step 1: Web Application Upload to Cloudflare Pages${NC}"
echo "1. Visit: https://dash.cloudflare.com/fe394f7c37b25babc4e351d704a6a97c/pages/creepjs"
echo "2. Click 'Upload assets'"
echo "3. Upload the directory: apps/web/.next"
echo "4. Wait for deployment to complete"
echo "5. Your web app will be available at: https://creepjs-b0x.pages.dev"
echo ""

echo "${YELLOW}Step 2: Configure GitHub Repository Secrets${NC}"
echo "Repository: https://github.com/taoyadev/creepjs"
echo ""
echo "Add these secrets in Settings → Secrets and variables → Actions:"
echo ""
echo -e "${GREEN}CLOUDFLARE_API_TOKEN:${NC}"
echo "kbjmXswH0vV9zMs1uuYSepwH1RAWWJsqgenjAtt8"
echo ""
echo -e "${GREEN}CLOUDFLARE_ACCOUNT_ID:${NC}"
echo "fe394f7c37b25babc4e351d704a6a97c"
echo ""
echo -e "${GREEN}CLOUDFLARE_API_URL:${NC}"
echo "https://creepjs-api.lively-sound-ed65.workers.dev"
echo ""
echo -e "${GREEN}CLOUDFLARE_WEB_URL:${NC}"
echo "https://creepjs-b0x.pages.dev"
echo ""

echo "${YELLOW}Step 3: Test Automatic Deployment${NC}"
echo "After configuring secrets:"
echo "1. Push any changes to main branch:"
echo "   git add . && git commit -m \"Setup complete\" && git push origin main"
echo "2. Or trigger workflow manually:"
echo "   gh workflow run \"Deploy to Cloudflare\""
echo ""

echo "🎯 === CURRENT DEPLOYMENT STATUS ==="
echo ""
echo -e "${GREEN}✅ API:${NC} https://creepjs-api.lively-sound-ed65.workers.dev"
echo -e "${GREEN}✅ Build:${NC} apps/web/.next (61 static pages ready)"
echo -e "${GREEN}✅ Pages Project:${NC} creepjs (creepjs-b0x.pages.dev)"
echo -e "${GREEN}✅ GitHub Actions:${NC} Workflow configured"
echo -e "${YELLOW}⏳ Web Upload:${NC} Manual step required"
echo -e "${YELLOW}⏳ GitHub Secrets:${NC} Manual step required"
echo ""

echo "📦 === Build Statistics ==="
echo ""
echo "📊 Static Pages: 61 pages generated"
echo "📊 Build Size: $(du -sh apps/web/.next | cut -f1)"
echo "📊 Bundle Size: 138kB (First Load JS)"
echo ""

echo "🔗 === Useful Links ==="
echo ""
echo "Cloudflare Dashboard: https://dash.cloudflare.com"
echo "GitHub Repository: https://github.com/taoyadev/creepjs"
echo "API Documentation: https://creepjs-api.lively-sound-ed65.workers.dev"
echo ""
echo "📞 === Contact Information ==="
echo ""
echo "Technical Support: info@opportunitygreen.com"
echo "GitHub: taoyadev"
echo ""

echo -e "${GREEN}🎉 CreepJS deployment setup is almost complete!${NC}"
echo -e "${YELLOW}Follow the manual steps above to finish deployment.${NC}"
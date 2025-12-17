#!/bin/bash

##############################################################################
# Setup Cloudflare Workers Secrets for CreepJS
#
# This script automates the management of secrets for the CreepJS API Worker.
# It prompts for secret values and uploads them using Wrangler CLI.
#
# Usage:
#   ./scripts/setup-secrets.sh [environment]
#
# Arguments:
#   environment - Optional: 'production', 'staging', or 'preview' (default: production)
#
# Requirements:
#   - wrangler CLI installed and authenticated
#   - Worker already created in Cloudflare Dashboard or via wrangler
#
# Example:
#   ./scripts/setup-secrets.sh production
#   ./scripts/setup-secrets.sh staging
##############################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT="${1:-production}"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   CreepJS - Cloudflare Workers Secrets Setup                 ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(production|staging|preview)$ ]]; then
    echo -e "${RED}❌ Error: Invalid environment '$ENVIRONMENT'${NC}"
    echo -e "${YELLOW}   Valid values: production, staging, preview${NC}"
    exit 1
fi

echo -e "${GREEN}🌍 Environment: ${ENVIRONMENT}${NC}"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Error: wrangler CLI is not installed${NC}"
    echo -e "${YELLOW}   Install it with: npm install -g wrangler${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Wrangler CLI found${NC}"

# Check if authenticated
if ! wrangler whoami &> /dev/null; then
    echo -e "${RED}❌ Error: Not authenticated with Cloudflare${NC}"
    echo -e "${YELLOW}   Run: wrangler login${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Authenticated with Cloudflare${NC}"
echo ""

# Define Worker name based on environment
if [ "$ENVIRONMENT" = "production" ]; then
    WORKER_NAME="creepjs-api"
    ENV_FLAG=""
else
    WORKER_NAME="creepjs-api-${ENVIRONMENT}"
    ENV_FLAG="--env ${ENVIRONMENT}"
fi

WRANGLER_DIR="apps/api"

echo -e "${BLUE}📦 Managing Secrets for Worker: ${WORKER_NAME}${NC}"
echo ""

# Function to set a secret
set_secret() {
    local secret_name=$1
    local secret_description=$2
    local is_optional=$3

    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Secret: ${secret_name}${NC}"
    echo -e "${BLUE}Description: ${secret_description}${NC}"

    if [ "$is_optional" = "true" ]; then
        echo -e "${YELLOW}(Optional - press Enter to skip)${NC}"
    fi
    echo ""

    # Prompt for secret value (hidden input)
    read -s -p "$(echo -e ${GREEN}Enter value for ${secret_name}:${NC} )" secret_value
    echo ""

    # Skip if empty and optional
    if [ -z "$secret_value" ] && [ "$is_optional" = "true" ]; then
        echo -e "${YELLOW}⏭  Skipped (optional secret)${NC}"
        echo ""
        return 0
    fi

    # Validate non-empty for required secrets
    if [ -z "$secret_value" ] && [ "$is_optional" = "false" ]; then
        echo -e "${RED}❌ Error: This secret is required and cannot be empty${NC}"
        echo ""
        return 1
    fi

    # Upload secret to Wrangler
    echo ""
    echo -e "${BLUE}Uploading secret to Cloudflare Workers...${NC}"

    if echo "$secret_value" | wrangler secret put "$secret_name" $ENV_FLAG --name "$WORKER_NAME" &> /dev/null; then
        echo -e "${GREEN}✓ Successfully set: ${secret_name}${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}❌ Failed to set: ${secret_name}${NC}"
        echo ""
        return 1
    fi
}

# Display intro
echo -e "${YELLOW}This script will guide you through setting up secrets for the CreepJS API Worker.${NC}"
echo -e "${YELLOW}Secrets are encrypted and securely stored in Cloudflare's infrastructure.${NC}"
echo ""
echo -e "${CYAN}Required secrets:${NC}"
echo -e "  • None currently required (API uses KV for tokens and rate limits)"
echo ""
echo -e "${CYAN}Optional secrets (for future use):${NC}"
echo -e "  • CREEPJS_TOKEN_PRIVATE_KEY - Private key for signing API tokens (future enhancement)"
echo ""
echo -e "${YELLOW}Press Ctrl+C at any time to cancel.${NC}"
echo ""
read -p "$(echo -e ${GREEN}Ready to proceed? [y/N]:${NC} )" -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Setup cancelled by user.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Setting up secrets...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Track failures
FAILED_SECRETS=()

# Set optional secrets
echo -e "${BLUE}📌 Optional Secrets${NC}"
echo ""

if ! set_secret \
    "CREEPJS_TOKEN_PRIVATE_KEY" \
    "Private key for signing API tokens (base64-encoded, 32+ bytes). Used for enhanced token security." \
    "true"; then
    FAILED_SECRETS+=("CREEPJS_TOKEN_PRIVATE_KEY")
fi

# Add more secrets here as needed in the future
# Example:
# if ! set_secret \
#     "WEBHOOK_SECRET" \
#     "Secret for validating webhook requests" \
#     "false"; then
#     FAILED_SECRETS+=("WEBHOOK_SECRET")
# fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check for failures
if [ ${#FAILED_SECRETS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠  Some secrets failed to upload:${NC}"
    for secret in "${FAILED_SECRETS[@]}"; do
        echo -e "  ${RED}✗${NC} $secret"
    done
    echo ""
    echo -e "${YELLOW}You can retry by running this script again.${NC}"
    echo ""
fi

# List all secrets for verification
echo -e "${BLUE}📝 Verifying secrets...${NC}"
echo ""

cd "$WRANGLER_DIR"

echo -e "${CYAN}Current secrets for ${WORKER_NAME}:${NC}"
if wrangler secret list $ENV_FLAG --name "$WORKER_NAME" 2>/dev/null; then
    echo ""
    echo -e "${GREEN}✅ Secrets successfully configured!${NC}"
else
    echo -e "${YELLOW}⚠  Unable to list secrets. They may still be set correctly.${NC}"
    echo -e "${YELLOW}   Check the Cloudflare Dashboard to verify.${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Secret Setup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}Next Steps:${NC}"
echo -e "  1. Deploy your Worker: ${YELLOW}cd apps/api && wrangler deploy${NC}"
echo -e "  2. Test the API: ${YELLOW}curl https://api.creepjs.org/${NC}"
echo -e "  3. Monitor logs: ${YELLOW}wrangler tail${NC}"
echo ""

echo -e "${BLUE}📚 Documentation:${NC}"
echo -e "   See .github/SECRETS.md for GitHub Actions secrets"
echo -e "   See docs/DEPLOYMENT.md for deployment procedures"
echo ""

# Display security reminders
echo -e "${CYAN}🔒 Security Reminders:${NC}"
echo -e "  ${GREEN}✓${NC} Secrets are encrypted at rest and in transit"
echo -e "  ${GREEN}✓${NC} Secrets are never exposed in logs or responses"
echo -e "  ${GREEN}✓${NC} Rotate secrets every 90 days for security"
echo -e "  ${GREEN}✓${NC} Use separate secrets for staging and production"
echo ""

echo -e "${GREEN}Setup complete! 🎉${NC}"

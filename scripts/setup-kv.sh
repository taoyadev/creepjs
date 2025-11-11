#!/bin/bash

##############################################################################
# Setup Cloudflare KV Namespaces for CreepJS
#
# This script automates the creation of KV namespaces required for the
# CreepJS API and updates the wrangler.toml configuration file.
#
# Usage:
#   ./scripts/setup-kv.sh [environment]
#
# Arguments:
#   environment - Optional: 'production', 'staging', or 'preview' (default: production)
#
# Requirements:
#   - wrangler CLI installed and authenticated
#   - jq for JSON parsing (optional but recommended)
#
# Example:
#   ./scripts/setup-kv.sh production
#   ./scripts/setup-kv.sh staging
##############################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT="${1:-production}"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   CreepJS - Cloudflare KV Namespace Setup                     ║${NC}"
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

# Define namespace names based on environment
TOKENS_NAMESPACE="creepjs_tokens_${ENVIRONMENT}"
RATELIMIT_NAMESPACE="creepjs_ratelimit_${ENVIRONMENT}"

WRANGLER_CONFIG="apps/api/wrangler.toml"
BACKUP_CONFIG="${WRANGLER_CONFIG}.backup"

echo -e "${BLUE}📦 Creating KV Namespaces...${NC}"
echo ""

# Function to create namespace and extract ID
create_namespace() {
    local namespace_name=$1
    local namespace_type=$2

    echo -e "${YELLOW}Creating namespace: ${namespace_name}${NC}"

    # Create the namespace and capture output
    output=$(wrangler kv:namespace create "$namespace_name" 2>&1)

    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to create namespace: ${namespace_name}${NC}"
        echo "$output"
        return 1
    fi

    # Extract namespace ID from output
    # Output format: "Created namespace for binding \"XXX\" with ID \"<id>\""
    namespace_id=$(echo "$output" | grep -oP 'ID "\K[^"]+' || echo "$output" | grep -oP 'id = "\K[^"]+')

    if [ -z "$namespace_id" ]; then
        # Try alternative parsing method
        namespace_id=$(echo "$output" | grep -oP '\b[a-f0-9]{32}\b')
    fi

    if [ -z "$namespace_id" ]; then
        echo -e "${RED}❌ Failed to extract namespace ID${NC}"
        echo "$output"
        return 1
    fi

    echo -e "${GREEN}✓ Created: ${namespace_name}${NC}"
    echo -e "${GREEN}  ID: ${namespace_id}${NC}"
    echo ""

    # Return the ID (via global variable to avoid subshell issues)
    if [ "$namespace_type" = "tokens" ]; then
        TOKENS_ID="$namespace_id"
    else
        RATELIMIT_ID="$namespace_id"
    fi
}

# Create namespaces
create_namespace "$TOKENS_NAMESPACE" "tokens"
create_namespace "$RATELIMIT_NAMESPACE" "ratelimit"

if [ -z "$TOKENS_ID" ] || [ -z "$RATELIMIT_ID" ]; then
    echo -e "${RED}❌ Failed to create one or more namespaces${NC}"
    exit 1
fi

echo -e "${BLUE}📝 Updating wrangler.toml...${NC}"
echo ""

# Backup existing config
if [ -f "$WRANGLER_CONFIG" ]; then
    cp "$WRANGLER_CONFIG" "$BACKUP_CONFIG"
    echo -e "${GREEN}✓ Backed up wrangler.toml to ${BACKUP_CONFIG}${NC}"
fi

# Update wrangler.toml with new namespace IDs
# This is a simple sed-based update - for production, consider using a proper TOML parser
if [ -f "$WRANGLER_CONFIG" ]; then
    # Update existing placeholder IDs
    sed -i.tmp "s/id = \"YOUR_KV_NAMESPACE_ID\"/id = \"${TOKENS_ID}\"/" "$WRANGLER_CONFIG"
    sed -i.tmp "s/id = \"YOUR_RATE_LIMIT_KV_ID\"/id = \"${RATELIMIT_ID}\"/" "$WRANGLER_CONFIG"
    rm -f "${WRANGLER_CONFIG}.tmp"

    echo -e "${GREEN}✓ Updated wrangler.toml with namespace IDs${NC}"
else
    echo -e "${YELLOW}⚠  wrangler.toml not found at ${WRANGLER_CONFIG}${NC}"
    echo -e "${YELLOW}   Please manually add the following to your wrangler.toml:${NC}"
    echo ""
    echo "[[kv_namespaces]]"
    echo "binding = \"TOKENS\""
    echo "id = \"${TOKENS_ID}\""
    echo ""
    echo "[[kv_namespaces]]"
    echo "binding = \"RATE_LIMIT\""
    echo "id = \"${RATELIMIT_ID}\""
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ KV Namespace Setup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Namespace Summary:${NC}"
echo -e "  ${YELLOW}Tokens Namespace:${NC}      ${TOKENS_NAMESPACE}"
echo -e "  ${YELLOW}Tokens ID:${NC}              ${TOKENS_ID}"
echo -e "  ${YELLOW}Rate Limit Namespace:${NC}  ${RATELIMIT_NAMESPACE}"
echo -e "  ${YELLOW}Rate Limit ID:${NC}          ${RATELIMIT_ID}"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo -e "  1. Verify the namespace IDs in ${WRANGLER_CONFIG}"
echo -e "  2. Deploy your Workers: ${YELLOW}wrangler deploy --env ${ENVIRONMENT}${NC}"
echo -e "  3. Test the API: ${YELLOW}curl https://api.creepjs.org/${NC}"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo -e "   See .github/SECRETS.md for GitHub Actions setup"
echo -e "   See docs/DEPLOYMENT.md for deployment procedures"
echo ""

# Optional: Test namespace access
read -p "$(echo -e ${YELLOW}Test namespace access? [y/N]:${NC} )" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}🧪 Testing namespace access...${NC}"

    # Write a test key
    echo "Testing KV write access..."
    if wrangler kv:key put --namespace-id="$TOKENS_ID" "test_key" "test_value" &> /dev/null; then
        echo -e "${GREEN}✓ Write access verified${NC}"

        # Read the test key
        if wrangler kv:key get --namespace-id="$TOKENS_ID" "test_key" &> /dev/null; then
            echo -e "${GREEN}✓ Read access verified${NC}"
        fi

        # Delete the test key
        wrangler kv:key delete --namespace-id="$TOKENS_ID" "test_key" &> /dev/null
        echo -e "${GREEN}✓ Delete access verified${NC}"
        echo ""
        echo -e "${GREEN}✅ All namespace operations successful!${NC}"
    else
        echo -e "${RED}❌ Failed to write to namespace${NC}"
        echo -e "${YELLOW}   Check your Cloudflare permissions${NC}"
    fi
fi

echo ""
echo -e "${GREEN}Setup complete! 🎉${NC}"

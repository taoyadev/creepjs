#!/bin/bash

##############################################################################
# Generate PWA Icons for CreepJS
#
# This script generates PNG icons from SVG for PWA and browser compatibility.
# Requires: ImageMagick or similar SVG-to-PNG converter
#
# Usage:
#   ./scripts/generate-icons.sh
##############################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   CreepJS - PWA Icon Generator                                ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

PUBLIC_DIR="apps/web/public"
ICON_SVG="$PUBLIC_DIR/icon.svg"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo -e "${YELLOW}⚠  ImageMagick not found${NC}"
    echo ""
    echo "To generate PNG icons, install ImageMagick:"
    echo ""
    echo "  macOS:   brew install imagemagick"
    echo "  Ubuntu:  sudo apt-get install imagemagick"
    echo "  Windows: choco install imagemagick"
    echo ""
    echo "Alternatively, use an online converter:"
    echo "  https://cloudconvert.com/svg-to-png"
    echo ""
    echo "Required icons:"
    echo "  - icon-192.png (192x192)"
    echo "  - icon-512.png (512x512)"
    echo "  - apple-touch-icon.png (180x180)"
    echo "  - favicon.ico (32x32)"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ ImageMagick found${NC}"
echo ""

# Check if source SVG exists
if [ ! -f "$ICON_SVG" ]; then
    echo -e "${YELLOW}⚠  Source icon not found: $ICON_SVG${NC}"
    exit 1
fi

echo -e "${BLUE}Generating icons from: $ICON_SVG${NC}"
echo ""

# Generate icons
echo -e "${YELLOW}Generating icon-192.png...${NC}"
convert -background none -resize 192x192 "$ICON_SVG" "$PUBLIC_DIR/icon-192.png"
echo -e "${GREEN}✓ Created icon-192.png${NC}"

echo -e "${YELLOW}Generating icon-512.png...${NC}"
convert -background none -resize 512x512 "$ICON_SVG" "$PUBLIC_DIR/icon-512.png"
echo -e "${GREEN}✓ Created icon-512.png${NC}"

echo -e "${YELLOW}Generating apple-touch-icon.png...${NC}"
convert -background none -resize 180x180 "$ICON_SVG" "$PUBLIC_DIR/apple-touch-icon.png"
echo -e "${GREEN}✓ Created apple-touch-icon.png${NC}"

echo -e "${YELLOW}Generating favicon.ico...${NC}"
convert -background none -resize 32x32 "$ICON_SVG" "$PUBLIC_DIR/favicon.ico"
echo -e "${GREEN}✓ Created favicon.ico${NC}"

echo ""
echo -e "${GREEN}✅ All icons generated successfully!${NC}"
echo ""
echo "Generated files:"
echo "  - $PUBLIC_DIR/icon-192.png"
echo "  - $PUBLIC_DIR/icon-512.png"
echo "  - $PUBLIC_DIR/apple-touch-icon.png"
echo "  - $PUBLIC_DIR/favicon.ico"
echo ""

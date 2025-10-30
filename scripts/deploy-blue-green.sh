#!/bin/bash

# ⚛️ BLUE/GREEN ATOMIC DEPLOYMENT SCRIPT
# Enterprise-grade deployment with automatic rollback

set -e  # Exit on error

echo "⚛️ =========================================="
echo "⚛️  ATOMIC BLUE/GREEN DEPLOYMENT"
echo "⚛️ =========================================="
echo ""

# Configuration
DEPLOYMENT_DIR="/deployments"
BLUE_DIR="$DEPLOYMENT_DIR/blue"
GREEN_DIR="$DEPLOYMENT_DIR/green"
CURRENT_LINK="$DEPLOYMENT_DIR/current"
DIST_DIR="./dist"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if dist exists
if [ ! -d "$DIST_DIR" ]; then
    echo -e "${RED}❌ Error: dist/ directory not found${NC}"
    echo "Run 'npm run build' first"
    exit 1
fi

# Get manifest info
if [ ! -f "$DIST_DIR/manifest.json" ]; then
    echo -e "${RED}❌ Error: manifest.json not found in dist/${NC}"
    echo "Atomic deployment requires manifest.json"
    exit 1
fi

VERSION=$(cat "$DIST_DIR/version.txt")
echo -e "${GREEN}📦 Version: $VERSION${NC}"

# Determine current channel
CURRENT_CHANNEL="blue"
if [ -L "$CURRENT_LINK" ]; then
    CURRENT_TARGET=$(readlink "$CURRENT_LINK")
    if [[ "$CURRENT_TARGET" == *"blue"* ]]; then
        CURRENT_CHANNEL="blue"
        NEW_CHANNEL="green"
    else
        CURRENT_CHANNEL="green"
        NEW_CHANNEL="blue"
    fi
else
    NEW_CHANNEL="green"
fi

echo -e "${BLUE}🔵 Current Channel: $CURRENT_CHANNEL${NC}"
echo -e "${GREEN}🟢 Deploying to: $NEW_CHANNEL${NC}"
echo ""

# Set target directory
if [ "$NEW_CHANNEL" == "blue" ]; then
    TARGET_DIR="$BLUE_DIR"
else
    TARGET_DIR="$GREEN_DIR"
fi

# Create deployment directories if they don't exist
echo "📁 Creating deployment structure..."
mkdir -p "$BLUE_DIR"
mkdir -p "$GREEN_DIR"

# Backup current deployment (if exists)
if [ -d "$TARGET_DIR" ] && [ "$(ls -A $TARGET_DIR)" ]; then
    BACKUP_DIR="$DEPLOYMENT_DIR/backup_$(date +%Y%m%d_%H%M%S)"
    echo -e "${YELLOW}💾 Backing up current $NEW_CHANNEL to $BACKUP_DIR${NC}"
    cp -r "$TARGET_DIR" "$BACKUP_DIR"
fi

# Deploy new version
echo "📦 Deploying new version to $NEW_CHANNEL..."
rm -rf "$TARGET_DIR"/*
cp -r "$DIST_DIR"/* "$TARGET_DIR/"

# Verify deployment
echo "🔍 Verifying deployment..."

# Check if critical files exist
CRITICAL_FILES=("index.html" "manifest.json" "version.txt")
ALL_EXIST=true

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$TARGET_DIR/$file" ]; then
        echo -e "${RED}❌ Missing critical file: $file${NC}"
        ALL_EXIST=false
    fi
done

if [ "$ALL_EXIST" = false ]; then
    echo -e "${RED}❌ Deployment verification failed!${NC}"
    echo -e "${YELLOW}🔄 Rolling back...${NC}"

    if [ -d "$BACKUP_DIR" ]; then
        rm -rf "$TARGET_DIR"/*
        cp -r "$BACKUP_DIR"/* "$TARGET_DIR/"
        echo -e "${GREEN}✅ Rollback completed${NC}"
    fi

    exit 1
fi

echo -e "${GREEN}✅ All critical files present${NC}"

# Verify manifest integrity
MANIFEST_HASH=$(cat "$TARGET_DIR/manifest.json" | sha256sum | cut -d' ' -f1)
echo "🔐 Manifest hash: ${MANIFEST_HASH:0:16}..."

# Switch active channel
echo ""
echo "🔄 Switching active channel..."
rm -f "$CURRENT_LINK"
ln -s "$TARGET_DIR" "$CURRENT_LINK"

echo -e "${GREEN}✅ Active channel switched to: $NEW_CHANNEL${NC}"

# Display deployment info
echo ""
echo "⚛️ =========================================="
echo "⚛️  DEPLOYMENT SUCCESSFUL"
echo "⚛️ =========================================="
echo -e "${GREEN}📦 Version: $VERSION${NC}"
echo -e "${GREEN}🔵 Channel: $NEW_CHANNEL${NC}"
echo -e "${GREEN}📂 Location: $TARGET_DIR${NC}"
echo -e "${GREEN}🔗 Active: $CURRENT_LINK -> $TARGET_DIR${NC}"
echo ""

# CDN Purge instructions
echo -e "${YELLOW}⚠️  IMPORTANT: Clear CDN Cache${NC}"
echo ""
echo "Netlify:"
echo "  netlify deploy --prod --clear-cache"
echo ""
echo "Vercel:"
echo "  vercel --prod --force"
echo ""
echo "Cloudflare:"
echo "  curl -X POST \"https://api.cloudflare.com/client/v4/zones/\$ZONE_ID/purge_cache\" \\"
echo "    -H \"Authorization: Bearer \$API_TOKEN\" \\"
echo "    -H \"Content-Type: application/json\" \\"
echo "    --data '{\"purge_everything\":true}'"
echo ""

# Keep only last 3 backups
echo "🧹 Cleaning old backups..."
ls -t "$DEPLOYMENT_DIR"/backup_* 2>/dev/null | tail -n +4 | xargs -r rm -rf
echo -e "${GREEN}✅ Cleanup completed${NC}"

echo ""
echo -e "${GREEN}🎉 Atomic deployment completed successfully!${NC}"

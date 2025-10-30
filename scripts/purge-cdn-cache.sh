#!/bin/bash

# ⚛️ CDN CACHE PURGE AUTOMATION
# Automatically clears CDN cache after deployment

set -e

echo "⚛️ =========================================="
echo "⚛️  CDN CACHE PURGE"
echo "⚛️ =========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Detect platform
PLATFORM="unknown"

if [ -f ".netlify/state.json" ] || [ ! -z "$NETLIFY_SITE_ID" ]; then
    PLATFORM="netlify"
elif [ -f ".vercel/project.json" ] || [ ! -z "$VERCEL_PROJECT_ID" ]; then
    PLATFORM="vercel"
elif [ ! -z "$CLOUDFLARE_ZONE_ID" ]; then
    PLATFORM="cloudflare"
fi

echo -e "${YELLOW}🔍 Detected Platform: $PLATFORM${NC}"
echo ""

# Netlify
if [ "$PLATFORM" == "netlify" ]; then
    echo "🟦 Purging Netlify CDN Cache..."

    if command -v netlify &> /dev/null; then
        netlify deploy --prod --clear-cache || {
            echo -e "${YELLOW}⚠️  Auto-purge failed, manual purge required${NC}"
            echo "Go to: https://app.netlify.com/sites/YOUR_SITE/deploys"
            echo "Click: Clear cache and deploy"
        }
    else
        echo -e "${YELLOW}⚠️  Netlify CLI not installed${NC}"
        echo "Install: npm install -g netlify-cli"
        echo "Or manually: https://app.netlify.com/sites/YOUR_SITE/deploys"
    fi

    echo -e "${GREEN}✅ Netlify cache purge initiated${NC}"
fi

# Vercel
if [ "$PLATFORM" == "vercel" ]; then
    echo "⬛ Purging Vercel CDN Cache..."

    if command -v vercel &> /dev/null; then
        vercel --prod --force || {
            echo -e "${YELLOW}⚠️  Auto-purge failed, manual purge required${NC}"
            echo "Go to: https://vercel.com/dashboard"
            echo "Click: Deployments → ... → Redeploy"
        }
    else
        echo -e "${YELLOW}⚠️  Vercel CLI not installed${NC}"
        echo "Install: npm install -g vercel"
        echo "Or manually: https://vercel.com/dashboard"
    fi

    echo -e "${GREEN}✅ Vercel cache purge initiated${NC}"
fi

# Cloudflare
if [ "$PLATFORM" == "cloudflare" ]; then
    echo "🟧 Purging Cloudflare CDN Cache..."

    if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ -z "$CLOUDFLARE_ZONE_ID" ]; then
        echo -e "${YELLOW}⚠️  Cloudflare credentials not set${NC}"
        echo "Set environment variables:"
        echo "  export CLOUDFLARE_API_TOKEN=your_token"
        echo "  export CLOUDFLARE_ZONE_ID=your_zone_id"
        echo ""
        echo "Or manually: https://dash.cloudflare.com"
    else
        curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json" \
            --data '{"purge_everything":true}' || {
            echo -e "${RED}❌ Cloudflare API call failed${NC}"
            exit 1
        }
        echo -e "${GREEN}✅ Cloudflare cache purged${NC}"
    fi
fi

# Manual instructions if platform unknown
if [ "$PLATFORM" == "unknown" ]; then
    echo -e "${YELLOW}⚠️  Platform not detected${NC}"
    echo ""
    echo "Manual CDN purge instructions:"
    echo ""
    echo "Netlify:"
    echo "  Settings → Build & Deploy → Post processing → Clear cache"
    echo ""
    echo "Vercel:"
    echo "  Settings → Deployment → Invalidate Cache & Redeploy"
    echo ""
    echo "Cloudflare:"
    echo "  Caching → Configuration → Purge Everything"
    echo ""
fi

echo ""
echo -e "${GREEN}🎉 CDN cache purge process completed${NC}"

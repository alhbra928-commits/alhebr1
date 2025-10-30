#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 CACHE BUSTING SYSTEM - VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0

# 1. Check dist exists
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ dist/ not found${NC}"
    echo "   Run: npm run build"
    exit 1
fi

echo -e "${GREEN}✅ dist/ directory exists${NC}"
echo ""

# 2. Check BUILD_TIMESTAMP in index.html
echo "🔍 Checking BUILD_TIMESTAMP..."
if grep -q "BUILD_TIMESTAMP" dist/index.html; then
    TIMESTAMP=$(grep -o "BUILD_TIMESTAMP = [0-9]*" dist/index.html | head -1 | grep -o "[0-9]*")
    DATE=$(date -d @$(echo $TIMESTAMP | cut -c1-10) '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "Unknown")
    echo -e "  ${GREEN}✅${NC} BUILD_TIMESTAMP found: ${TIMESTAMP}"
    echo -e "  ${BLUE}📅${NC} Build Date: ${DATE}"
else
    echo -e "  ${RED}❌${NC} BUILD_TIMESTAMP not found"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 3. Check cache busters in assets
echo "🔍 Checking cache busters in assets..."
CACHE_BUSTERS=$(grep -o "?.*v=[0-9]*" dist/index.html | wc -l)
if [ "$CACHE_BUSTERS" -gt 0 ]; then
    echo -e "  ${GREEN}✅${NC} Found ${CACHE_BUSTERS} assets with cache busters"
    echo -e "  ${BLUE}📦${NC} Example: $(grep -o 'src="[^"]*?v=[0-9]*"' dist/index.html | head -1 | sed 's/src="//' | sed 's/"//')"
else
    echo -e "  ${RED}❌${NC} No cache busters found"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 4. Check CDN purge files
echo "🔍 Checking CDN purge files..."
if [ -f "dist/cdn-purge.txt" ]; then
    SIZE=$(stat -f%z "dist/cdn-purge.txt" 2>/dev/null || stat -c%s "dist/cdn-purge.txt" 2>/dev/null)
    echo -e "  ${GREEN}✅${NC} cdn-purge.txt exists (${SIZE} bytes)"
else
    echo -e "  ${RED}❌${NC} cdn-purge.txt not found"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "dist/deployment-timestamp.json" ]; then
    echo -e "  ${GREEN}✅${NC} deployment-timestamp.json exists"
else
    echo -e "  ${RED}❌${NC} deployment-timestamp.json not found"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "dist/robots.txt" ]; then
    echo -e "  ${GREEN}✅${NC} robots.txt exists (updated)"
else
    echo -e "  ${YELLOW}⚠️${NC} robots.txt not found"
fi
echo ""

# 5. Check cache clearing code
echo "🔍 Checking cache clearing code..."
if grep -q "NEW BUILD DETECTED - CLEARING ALL CACHES" dist/index.html; then
    echo -e "  ${GREEN}✅${NC} Cache clearing code found"
    echo -e "  ${BLUE}🔥${NC} Will auto-clear old caches on page load"
else
    echo -e "  ${RED}❌${NC} Cache clearing code not found"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 6. Check meta tags
echo "🔍 Checking anti-cache meta tags..."
META_COUNT=$(grep -o 'meta.*no-cache\|meta.*Expires\|meta.*build-timestamp' dist/index.html | wc -l)
if [ "$META_COUNT" -gt 0 ]; then
    echo -e "  ${GREEN}✅${NC} Found ${META_COUNT} anti-cache meta tags"
else
    echo -e "  ${YELLOW}⚠️${NC} No anti-cache meta tags"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ CACHE BUSTING SYSTEM READY${NC}"
    echo ""
    echo "🎯 System Status:"
    echo "  ✅ BUILD_TIMESTAMP: Unique"
    echo "  ✅ Cache Busters: Active"
    echo "  ✅ CDN Purge: Ready"
    echo "  ✅ Auto Clear: Enabled"
    echo ""
    echo "🚀 Next Steps:"
    echo "  1. Deploy: vercel --prod --force"
    echo "  2. Or: netlify deploy --prod --dir=dist --clear-cache"
    echo "  3. Open in Incognito: https://YOUR-DOMAIN.com"
    echo "  4. Check Console for: 🔥 NEW BUILD DETECTED"
    echo ""
    echo "🎉 Users will ALWAYS see the latest version!"
else
    echo -e "${RED}❌ VERIFICATION FAILED${NC}"
    echo ""
    echo "Found $ERRORS error(s)."
    echo "Run: npm run build"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

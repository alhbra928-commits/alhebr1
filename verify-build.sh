#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 ATOMIC DEPLOYMENT - BUILD VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0

# Check dist directory
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ dist/ directory not found${NC}"
    echo "   Run: npm run build"
    exit 1
fi

echo "✅ dist/ directory exists"
echo ""

# Critical files
echo "📁 Checking critical files..."
echo ""

FILES=(
    "manifest.json:7000:9000"
    "version.txt:10:30"
    "atomic-sw.js:6000:7000"
    "service-worker.js:4000:6000"
    "deployment-info.json:100:300"
    "index.html:8000:15000"
)

for FILE_INFO in "${FILES[@]}"; do
    IFS=':' read -r FILE MIN_SIZE MAX_SIZE <<< "$FILE_INFO"
    
    if [ -f "dist/$FILE" ]; then
        SIZE=$(stat -f%z "dist/$FILE" 2>/dev/null || stat -c%s "dist/$FILE" 2>/dev/null)
        
        if [ "$SIZE" -ge "$MIN_SIZE" ] && [ "$SIZE" -le "$MAX_SIZE" ]; then
            echo -e "  ${GREEN}✅${NC} $FILE (${SIZE} bytes)"
        else
            echo -e "  ${YELLOW}⚠️${NC} $FILE (${SIZE} bytes - unexpected size)"
        fi
    else
        echo -e "  ${RED}❌${NC} $FILE (not found)"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""

# Check manifest.json content
if [ -f "dist/manifest.json" ]; then
    echo "📦 Checking manifest.json content..."
    
    VERSION=$(grep -o '"version": "[^"]*"' dist/manifest.json | cut -d'"' -f4)
    CHANNEL=$(grep -o '"channel": "[^"]*"' dist/manifest.json | cut -d'"' -f4)
    STRATEGY=$(grep -o '"strategy": "[^"]*"' dist/manifest.json | cut -d'"' -f4)
    ROLLBACK=$(grep -o '"rollbackEnabled": [^,]*' dist/manifest.json | cut -d':' -f2 | tr -d ' ')
    
    if [ ! -z "$VERSION" ]; then
        echo -e "  ${GREEN}✅${NC} Version: $VERSION"
    else
        echo -e "  ${RED}❌${NC} Version not found"
        ERRORS=$((ERRORS + 1))
    fi
    
    if [ "$CHANNEL" == "blue" ] || [ "$CHANNEL" == "green" ]; then
        echo -e "  ${GREEN}✅${NC} Channel: $CHANNEL"
    else
        echo -e "  ${RED}❌${NC} Channel: $CHANNEL (invalid)"
        ERRORS=$((ERRORS + 1))
    fi
    
    if [ "$STRATEGY" == "atomic" ]; then
        echo -e "  ${GREEN}✅${NC} Strategy: $STRATEGY"
    else
        echo -e "  ${RED}❌${NC} Strategy: $STRATEGY (should be 'atomic')"
        ERRORS=$((ERRORS + 1))
    fi
    
    if [ "$ROLLBACK" == "true" ]; then
        echo -e "  ${GREEN}✅${NC} Rollback: Enabled"
    else
        echo -e "  ${RED}❌${NC} Rollback: Disabled (should be enabled)"
        ERRORS=$((ERRORS + 1))
    fi
    
    FILES_COUNT=$(grep -o '"hash": "sha256-[^"]*"' dist/manifest.json | wc -l)
    echo -e "  ${GREEN}✅${NC} Files with SHA256: $FILES_COUNT"
    
    echo ""
fi

# Check index.html for atomic code
if [ -f "dist/index.html" ]; then
    echo "🔍 Checking index.html for Atomic code..."
    
    if grep -q "ATOMIC DEPLOYMENT INITIALIZING" dist/index.html; then
        echo -e "  ${GREEN}✅${NC} Atomic initialization code found"
    else
        echo -e "  ${RED}❌${NC} Atomic initialization code NOT found"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "fetch('/manifest.json" dist/index.html; then
        echo -e "  ${GREEN}✅${NC} Manifest fetch code found"
    else
        echo -e "  ${RED}❌${NC} Manifest fetch code NOT found"
        ERRORS=$((ERRORS + 1))
    fi
    
    echo ""
fi

# Check config files
echo "⚙️ Checking configuration files..."
echo ""

if [ -f "vercel.json" ]; then
    if grep -q '"outputDirectory": "dist"' vercel.json; then
        echo -e "  ${GREEN}✅${NC} vercel.json configured correctly"
    else
        echo -e "  ${YELLOW}⚠️${NC} vercel.json may need outputDirectory"
    fi
else
    echo -e "  ${YELLOW}⚠️${NC} vercel.json not found (ok if using Netlify)"
fi

if [ -f "netlify.toml" ]; then
    if grep -q 'publish = "dist"' netlify.toml; then
        echo -e "  ${GREEN}✅${NC} netlify.toml configured correctly"
    else
        echo -e "  ${YELLOW}⚠️${NC} netlify.toml may need publish = \"dist\""
    fi
else
    echo -e "  ${YELLOW}⚠️${NC} netlify.toml not found (ok if using Vercel)"
fi

if [ -f ".vercelignore" ]; then
    echo -e "  ${GREEN}✅${NC} .vercelignore exists"
else
    echo -e "  ${YELLOW}⚠️${NC} .vercelignore not found"
fi

if [ -f ".netlifyignore" ]; then
    echo -e "  ${GREEN}✅${NC} .netlifyignore exists"
else
    echo -e "  ${YELLOW}⚠️${NC} .netlifyignore not found"
fi

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ BUILD VERIFICATION PASSED${NC}"
    echo ""
    echo "All systems ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "  1. Deploy: vercel --prod --force"
    echo "  2. Or: netlify deploy --prod --dir=dist --clear-cache"
    echo "  3. Wait 2 minutes"
    echo "  4. Test: https://YOUR-DOMAIN.com/manifest.json"
else
    echo -e "${RED}❌ BUILD VERIFICATION FAILED${NC}"
    echo ""
    echo "Found $ERRORS error(s)."
    echo "Fix the issues above and run: npm run build"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

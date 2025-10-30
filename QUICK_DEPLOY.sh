#!/bin/bash

# 🚀 QUICK DEPLOY SCRIPT
# This script helps you deploy the platform quickly

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌿 Palm & Olive Platform - Quick Deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Step 1: Building production version...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Build successful!${NC}"
echo ""

# Check if dist exists
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ dist folder not found!${NC}"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Choose deployment method:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Vercel (Recommended - Fastest)"
echo "2. Netlify"
echo "3. Test locally with serve"
echo "4. Just build (manual deployment)"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"

        # Check if vercel is installed
        if ! command -v vercel &> /dev/null; then
            echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
            npm install -g vercel
        fi

        echo ""
        echo -e "${BLUE}📝 Running: vercel --prod --force${NC}"
        vercel --prod --force

        echo ""
        echo -e "${GREEN}✅ Deployed to Vercel!${NC}"
        echo -e "${GREEN}🌐 Your site is now live!${NC}"
        ;;

    2)
        echo ""
        echo -e "${BLUE}🚀 Deploying to Netlify...${NC}"

        # Check if netlify is installed
        if ! command -v netlify &> /dev/null; then
            echo -e "${YELLOW}⚠️  Netlify CLI not found. Installing...${NC}"
            npm install -g netlify-cli
        fi

        echo ""
        echo -e "${BLUE}📝 Running: netlify deploy --prod --dir=dist${NC}"
        netlify deploy --prod --dir=dist --clear-cache

        echo ""
        echo -e "${GREEN}✅ Deployed to Netlify!${NC}"
        echo -e "${GREEN}🌐 Your site is now live!${NC}"
        ;;

    3)
        echo ""
        echo -e "${BLUE}🧪 Testing locally...${NC}"

        # Check if serve is installed
        if ! command -v serve &> /dev/null; then
            echo -e "${YELLOW}⚠️  serve not found. Installing...${NC}"
            npm install -g serve
        fi

        echo ""
        echo -e "${GREEN}✅ Starting local server on http://localhost:3000${NC}"
        echo -e "${YELLOW}⚠️  Press Ctrl+C to stop${NC}"
        echo ""
        serve -s dist -p 3000
        ;;

    4)
        echo ""
        echo -e "${GREEN}✅ Build completed!${NC}"
        echo ""
        echo "📁 Files are ready in: dist/"
        echo ""
        echo "Next steps:"
        echo "1. Upload dist/ folder to your server"
        echo "2. Configure your web server (Nginx/Apache)"
        echo "3. Setup SSL certificate"
        echo ""
        echo "See PRODUCTION_DEPLOYMENT_GUIDE.md for details"
        ;;

    *)
        echo -e "${RED}❌ Invalid choice!${NC}"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Done!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

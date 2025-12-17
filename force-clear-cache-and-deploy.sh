#!/bin/bash

###############################################################################
# 🔥 FORCE CLEAR CACHE AND REDEPLOY SCRIPT
# يمسح الكاش ويعيد النشر بقوة
###############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔥 FORCE CLEAR CACHE AND REDEPLOY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1️⃣ Clean everything
echo "🧹 تنظيف كل الملفات القديمة..."
rm -rf dist node_modules/.vite package-lock.json
echo "✅ تم مسح dist و cache"
echo ""

# 2️⃣ Reinstall dependencies
echo "📦 إعادة تثبيت Dependencies..."
npm install
echo "✅ تم تثبيت Dependencies"
echo ""

# 3️⃣ Generate new cache buster
echo "🎲 إنشاء Cache Buster جديد..."
node scripts/generate-cache-buster.js
echo "✅ تم إنشاء Cache Buster"
echo ""

# 4️⃣ Build with new version
echo "🏗️ بناء المشروع بنسخة جديدة..."
npm run build
echo "✅ تم البناء بنجاح"
echo ""

# 5️⃣ Show version info
if [ -f "dist/version.txt" ]; then
  echo "📌 النسخة الجديدة:"
  cat dist/version.txt
  echo ""
fi

# 6️⃣ Instructions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ البناء انتهى بنجاح!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 الخطوات التالية:"
echo ""
echo "1️⃣  ارفع الملفات إلى Netlify/Vercel:"
echo "   - اسحب مجلد dist وأفلته في Netlify"
echo "   - أو استخدم: netlify deploy --prod --dir=dist"
echo "   - أو استخدم: vercel --prod"
echo ""
echo "2️⃣  امسح CDN Cache من لوحة التحكم:"
echo "   - Netlify: Site Settings → Clear cache"
echo "   - Vercel: Project Settings → Clear cache"
echo "   - Cloudflare: Caching → Purge Everything"
echo ""
echo "3️⃣  امسح كاش المتصفح:"
echo "   - Windows/Linux: Ctrl + Shift + Delete"
echo "   - Mac: Command + Shift + Delete"
echo ""
echo "4️⃣  افتح الموقع في Incognito:"
echo "   - Chrome: Ctrl + Shift + N"
echo "   - ثم افتح: https://hisas1.com"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 تم بنجاح!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

#!/bin/bash

# 🚀 سكريبت النشر التلقائي لـ mzad1.com
# الاستخدام: ./deploy.sh

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 بدء عملية النشر لـ mzad1.com"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# الخطوة 1: التنظيف
echo "📦 الخطوة 1/5: تنظيف الملفات القديمة..."
rm -rf dist/
echo "✅ تم التنظيف"
echo ""

# الخطوة 2: Build
echo "🔨 الخطوة 2/5: بناء المشروع..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build نجح!"
else
    echo "❌ Build فشل! توقف."
    exit 1
fi
echo ""

# الخطوة 3: التحقق من الملفات
echo "🔍 الخطوة 3/5: التحقق من الملفات..."

if [ -f "dist/index.html" ]; then
    echo "✅ index.html موجود"
else
    echo "❌ index.html غير موجود!"
    exit 1
fi

if [ -f "dist/version-manifest.json" ]; then
    echo "✅ version-manifest.json موجود"
    VERSION=$(cat dist/version-manifest.json | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
    echo "📌 الإصدار: $VERSION"
else
    echo "❌ version-manifest.json غير موجود!"
    exit 1
fi

if [ -f "dist/service-worker.js" ]; then
    echo "✅ service-worker.js موجود"
else
    echo "❌ service-worker.js غير موجود!"
    exit 1
fi

if [ -f "dist/force-update.html" ]; then
    echo "✅ force-update.html موجود"
else
    echo "❌ force-update.html غير موجود!"
    exit 1
fi

if [ -d "dist/assets" ]; then
    FILE_COUNT=$(ls -1 dist/assets | wc -l)
    echo "✅ assets/ موجود ($FILE_COUNT ملف)"
else
    echo "❌ assets/ غير موجود!"
    exit 1
fi
echo ""

# الخطوة 4: Deploy
echo "🚀 الخطوة 4/5: نشر المشروع..."

# تحقق من وجود Netlify CLI
if command -v netlify &> /dev/null; then
    echo "📡 استخدام Netlify CLI..."
    netlify deploy --prod --dir=dist

    if [ $? -eq 0 ]; then
        echo "✅ تم النشر بنجاح!"
    else
        echo "❌ فشل النشر!"
        echo "💡 جرّب: netlify login"
        exit 1
    fi
else
    echo "⚠️  Netlify CLI غير مثبت"
    echo ""
    echo "الخيارات المتاحة:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "خيار 1: تثبيت Netlify CLI"
    echo "  npm install -g netlify-cli"
    echo "  netlify login"
    echo "  ./deploy.sh"
    echo ""
    echo "خيار 2: Netlify Drop (يدوي)"
    echo "  1. افتح: https://app.netlify.com/drop"
    echo "  2. اسحب مجلد dist/ كامل"
    echo "  3. ✅ تم!"
    echo ""
    echo "خيار 3: Netlify Dashboard"
    echo "  1. افتح: https://app.netlify.com"
    echo "  2. Add new site > Deploy manually"
    echo "  3. Upload مجلد dist/"
    echo ""
    exit 1
fi
echo ""

# الخطوة 5: التحقق
echo "✅ الخطوة 5/5: ملخص النشر"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 الإصدار: $VERSION"
echo "📅 التاريخ: $(date '+%Y-%m-%d %H:%M:%S')"
echo "🌐 الموقع: https://mzad1.com"
echo ""
echo "🔗 روابط مهمة:"
echo "   المنصة:       https://mzad1.com"
echo "   Force Update: https://mzad1.com/force-update.html"
echo "   Version Info: https://mzad1.com/version-manifest.json"
echo ""
echo "📱 للمستخدمين:"
echo "   أرسل لهم: https://mzad1.com/force-update.html"
echo "   واطلب منهم الضغط على الزر الأصفر"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ عملية النشر اكتملت بنجاح!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

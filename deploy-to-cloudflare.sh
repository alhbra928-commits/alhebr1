#!/bin/bash

echo "════════════════════════════════════════════════════════"
echo "🔶 Cloudflare Pages - نظام النشر التلقائي"
echo "════════════════════════════════════════════════════════"
echo ""

# التحقق من Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت!"
    echo "📥 حمل Node.js من: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js مثبت: $(node --version)"
echo ""

# التحقق من Wrangler
echo "🔍 التحقق من Wrangler..."
if ! command -v wrangler &> /dev/null; then
    echo "⚠️  Wrangler غير مثبت"
    echo "📦 جاري تثبيت Wrangler..."
    echo ""

    npm install -g wrangler

    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ فشل تثبيت Wrangler"
        echo ""
        echo "════════════════════════════════════════════════════════"
        echo "💡 جرب الحل البديل: Netlify"
        echo "════════════════════════════════════════════════════════"
        echo ""
        echo "1. افتح: https://app.netlify.com/drop"
        echo "2. اسحب مجلد 'dist' من:"
        echo "   /tmp/cc-agent/58919512/project/dist"
        echo "3. ✅ تم النشر!"
        echo ""
        exit 1
    fi

    echo "✅ تم تثبيت Wrangler بنجاح"
else
    echo "✅ Wrangler مثبت مسبقاً: $(wrangler --version)"
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "🔐 تسجيل الدخول إلى Cloudflare"
echo "════════════════════════════════════════════════════════"
echo ""

# التحقق من تسجيل الدخول
wrangler whoami &> /dev/null

if [ $? -ne 0 ]; then
    echo "⚠️  لم تسجل الدخول بعد"
    echo "🌐 جاري فتح صفحة تسجيل الدخول..."
    echo ""
    echo "📌 ستفتح نافذة متصفح - سجل الدخول وارجع هنا"
    echo ""
    read -p "اضغط Enter للمتابعة..."

    wrangler login

    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ فشل تسجيل الدخول"
        exit 1
    fi

    echo ""
    echo "✅ تم تسجيل الدخول بنجاح"
else
    echo "✅ أنت مسجل دخول مسبقاً"
    wrangler whoami
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "📦 التحقق من ملفات المشروع"
echo "════════════════════════════════════════════════════════"
echo ""

# التحقق من مجلد dist
if [ ! -d "dist" ]; then
    echo "⚠️  مجلد dist غير موجود"
    echo "🔨 جاري بناء المشروع..."
    echo ""

    npm run build

    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ فشل بناء المشروع"
        exit 1
    fi

    echo ""
    echo "✅ تم بناء المشروع بنجاح"
else
    echo "✅ مجلد dist موجود"
    echo "📊 عدد الملفات: $(find dist -type f | wc -l)"
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "🚀 النشر على Cloudflare Pages"
echo "════════════════════════════════════════════════════════"
echo ""
echo "📤 جاري رفع الملفات..."
echo ""

# النشر
wrangler pages deploy dist --project-name=palm-olive-platform

if [ $? -eq 0 ]; then
    echo ""
    echo "════════════════════════════════════════════════════════"
    echo "🎉 تم النشر بنجاح!"
    echo "════════════════════════════════════════════════════════"
    echo ""
    echo "🌐 رابط المشروع:"
    echo "   https://palm-olive-platform.pages.dev"
    echo ""
    echo "📊 معلومات المشروع:"
    echo "   ✅ CDN عالمي سريع"
    echo "   ✅ SSL تلقائي (HTTPS)"
    echo "   ✅ Bandwidth غير محدود"
    echo "   ✅ حماية DDoS"
    echo ""
    echo "🔍 للتحقق:"
    echo "   1. افتح الرابط في المتصفح"
    echo "   2. اضغط F12 (Developer Tools)"
    echo "   3. ابحث في Console عن:"
    echo "      ✅ VERSION UP-TO-DATE"
    echo ""
    echo "════════════════════════════════════════════════════════"
    echo "💎 تهانينا! مشروعك الآن على الإنترنت"
    echo "════════════════════════════════════════════════════════"
    echo ""
else
    echo ""
    echo "════════════════════════════════════════════════════════"
    echo "❌ فشل النشر"
    echo "════════════════════════════════════════════════════════"
    echo ""
    echo "💡 الحلول البديلة:"
    echo ""
    echo "1️⃣ جرب مرة أخرى:"
    echo "   ./deploy-to-cloudflare.sh"
    echo ""
    echo "2️⃣ استخدم Netlify (أسهل):"
    echo "   https://app.netlify.com/drop"
    echo ""
    echo "3️⃣ استخدم Vercel:"
    echo "   https://vercel.com/new"
    echo ""
    exit 1
fi

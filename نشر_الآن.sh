#!/bin/bash

###############################################################################
# 🔥 نشر النسخة الجديدة - سكريبت تلقائي
###############################################################################

echo "═══════════════════════════════════════════════════════════════════"
echo "🔥 نشر النسخة الجديدة"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Check if dist exists
if [ ! -d "dist" ]; then
  echo "❌ مجلد dist غير موجود!"
  echo "قم بتشغيل: npm run build"
  exit 1
fi

echo "📦 مجلد dist موجود"
echo ""

# Show version
if [ -f "dist/version.txt" ]; then
  echo "📌 النسخة:"
  cat dist/version.txt
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "اختر طريقة النشر:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1) Netlify (يدوي - اسحب وأفلت)"
echo "2) Netlify (CLI - تلقائي)"
echo "3) Vercel (CLI - تلقائي)"
echo "4) عرض التعليمات فقط"
echo ""
read -p "اختر رقم (1-4): " choice

case $choice in
  1)
    echo ""
    echo "═══════════════════════════════════════════════════════════════════"
    echo "📋 Netlify - النشر اليدوي"
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""
    echo "1. اذهب إلى: https://app.netlify.com"
    echo "2. افتح موقعك"
    echo "3. اسحب مجلد dist/ وأفلته في Netlify"
    echo "4. انتظر حتى ينتهي الرفع"
    echo ""
    echo "ثم امسح CDN Cache:"
    echo "  → Site Settings → Build & Deploy"
    echo "  → Clear cache and retry deploy"
    echo ""
    ;;

  2)
    echo ""
    echo "═══════════════════════════════════════════════════════════════════"
    echo "🚀 Netlify - النشر التلقائي"
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""

    # Check if netlify CLI is installed
    if ! command -v netlify &> /dev/null; then
      echo "❌ Netlify CLI غير مثبت!"
      echo ""
      echo "قم بتثبيته أولاً:"
      echo "  npm install -g netlify-cli"
      echo ""
      exit 1
    fi

    echo "📤 جاري النشر إلى Netlify..."
    echo ""
    netlify deploy --prod --dir=dist

    if [ $? -eq 0 ]; then
      echo ""
      echo "✅ تم النشر بنجاح!"
      echo ""
      echo "⚠️ لا تنسَ مسح CDN Cache:"
      echo "  1. اذهب إلى: https://app.netlify.com"
      echo "  2. Site Settings → Build & Deploy"
      echo "  3. Clear cache and retry deploy"
      echo ""
    else
      echo ""
      echo "❌ فشل النشر!"
      exit 1
    fi
    ;;

  3)
    echo ""
    echo "═══════════════════════════════════════════════════════════════════"
    echo "🚀 Vercel - النشر التلقائي"
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""

    # Check if vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
      echo "❌ Vercel CLI غير مثبت!"
      echo ""
      echo "قم بتثبيته أولاً:"
      echo "  npm install -g vercel"
      echo ""
      exit 1
    fi

    echo "📤 جاري النشر إلى Vercel..."
    echo ""
    vercel --prod

    if [ $? -eq 0 ]; then
      echo ""
      echo "✅ تم النشر بنجاح!"
      echo ""
      echo "⚠️ لا تنسَ مسح CDN Cache:"
      echo "  1. اذهب إلى: https://vercel.com/dashboard"
      echo "  2. Project Settings → General"
      echo "  3. Clear Cache"
      echo "  4. Deployments → Redeploy"
      echo ""
    else
      echo ""
      echo "❌ فشل النشر!"
      exit 1
    fi
    ;;

  4)
    echo ""
    echo "═══════════════════════════════════════════════════════════════════"
    echo "📋 التعليمات الكاملة"
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""
    echo "اقرأ الملفات التالية:"
    echo ""
    echo "  • تم_التطبيق_العملي.txt - تعليمات نصية"
    echo "  • ما_تم_عمله_الآن.html - دليل تفاعلي (افتحه في المتصفح)"
    echo ""
    ;;

  *)
    echo ""
    echo "❌ اختيار غير صحيح!"
    exit 1
    ;;
esac

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 انتهى!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

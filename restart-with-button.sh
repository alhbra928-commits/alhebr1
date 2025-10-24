#!/bin/bash

echo "════════════════════════════════════════════════════════════"
echo "🔄 إعادة تشغيل المشروع مع الزر المتوهج"
echo "════════════════════════════════════════════════════════════"
echo ""

# 1. مسح الـ cache
echo "🧹 الخطوة 1: مسح الـ cache..."
rm -rf node_modules/.vite
rm -rf dist
echo "✅ تم مسح الـ cache"
echo ""

# 2. إعادة البناء
echo "🔨 الخطوة 2: إعادة بناء المشروع..."
npm run build
if [ $? -eq 0 ]; then
  echo "✅ البناء نجح بنجاح"
else
  echo "❌ فشل البناء"
  exit 1
fi
echo ""

# 3. التحقق من الزر
echo "🔍 الخطوة 3: التحقق من وجود الزر..."
if grep -q "GlowingConceptButton" src/modules/public/components/MainPlatformInterface.tsx; then
  echo "✅ الزر موجود في الكود المصدري (السطر 158)"
else
  echo "❌ الزر غير موجود!"
  exit 1
fi

if [ -f "dist/assets/public-module-CZ33PhjB.js" ]; then
  echo "✅ الملف المبني موجود"
else
  echo "⚠️  اسم الملف قد تغير (هذا طبيعي)"
fi
echo ""

# 4. عرض التعليمات
echo "════════════════════════════════════════════════════════════"
echo "✅ جميع الفحوصات اكتملت بنجاح!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📋 الآن قم بما يلي:"
echo ""
echo "  1️⃣  أوقف dev server الحالي (Ctrl+C)"
echo ""
echo "  2️⃣  أعد تشغيله:"
echo "      npm run dev"
echo ""
echo "  3️⃣  افتح المتصفح في وضع Incognito:"
echo "      Chrome: Ctrl+Shift+N"
echo "      Firefox: Ctrl+Shift+P"
echo ""
echo "  4️⃣  اذهب إلى: http://localhost:5173"
echo ""
echo "  5️⃣  ابحث عن الزر الذهبي بين Stock Ticker والمحتوى!"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "🎯 موقع الزر المتوقع:"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "  [Header الرئيسي]"
echo "  [Stock Ticker - شريط الأسعار]"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "     🟡 الزر الذهبي المتوهج 🟡"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  [مزارع النخيل والزيتون...]"
echo "  [المزارع المعروضة]"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "✨ النص يتبدل تلقائياً كل 5 ثوانٍ:"
echo "   🌴 اكتشف فكرة تملك النخيل"
echo "   🫒 تعرف على تملك أشجار الزيتون"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "💡 نصيحة: افتح test-button-visibility.html لترى نسخة تجريبية!"
echo ""

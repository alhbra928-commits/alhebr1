#!/bin/bash

echo "🔍 التحقق من وجود BottomNavBar في الكود المبني..."
echo ""

# Check if dist exists
if [ ! -d "dist" ]; then
    echo "❌ مجلد dist/ غير موجود!"
    echo "   الرجاء تشغيل: npm run build"
    exit 1
fi

echo "✅ مجلد dist/ موجود"
echo ""

# Check investor portal module
INVESTOR_FILE=$(ls dist/assets/investor-portal-module-*.js 2>/dev/null | head -1)
if [ -z "$INVESTOR_FILE" ]; then
    echo "❌ ملف investor-portal-module غير موجود!"
    exit 1
fi

echo "✅ ملف Investor Portal موجود: $(basename $INVESTOR_FILE)"
echo ""

# Check for BottomNavBar code
echo "🔎 البحث عن BottomNavBar في الكود..."
if grep -q "bottom-0.*z-50.*lg:hidden" "$INVESTOR_FILE"; then
    echo "✅ BottomNavBar موجود في الكود المبني!"
else
    echo "❌ BottomNavBar غير موجود في الكود!"
    exit 1
fi

# Check for FAB
if grep -q "w-14 h-14 rounded-full.*gradient" "$INVESTOR_FILE"; then
    echo "✅ FAB (Floating Action Button) موجود!"
else
    echo "⚠️  FAB قد لا يكون موجود"
fi

# Check for AI Assistant
if grep -q "🤖\|robot" "$INVESTOR_FILE"; then
    echo "✅ AI Assistant موجود!"
else
    echo "⚠️  AI Assistant قد لا يكون موجود"
fi

echo ""
echo "📊 إحصائيات الملف:"
echo "   الحجم: $(ls -lh "$INVESTOR_FILE" | awk '{print $5}')"
echo "   السطور: $(wc -l < "$INVESTOR_FILE" | tr -d ' ')"
echo ""

# Check FarmOwner module
OWNER_FILE=$(ls dist/assets/FarmOwnerRouter-*.js 2>/dev/null | head -1)
if [ -n "$OWNER_FILE" ]; then
    echo "✅ ملف Farm Owner موجود: $(basename $OWNER_FILE)"
    if grep -q "bottom-0.*z-50.*lg:hidden" "$OWNER_FILE"; then
        echo "✅ BottomNavBar موجود في Farm Owner أيضاً!"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ التطوير موجود بالكامل في dist/"
echo ""
echo "⚠️  لكن يجب رفعه على السيرفر حتى تراه!"
echo ""
echo "📦 الخطوات التالية:"
echo "   1. ارفع dist/ على Netlify أو Vercel"
echo "   2. احصل على رابط جديد"
echo "   3. امسح الكاش (Ctrl+Shift+R)"
echo "   4. افتح الرابط الجديد"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

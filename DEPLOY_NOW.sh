#!/bin/bash

echo "🚀 بدء نشر التحديث..."
echo ""

# Check if dist exists
if [ ! -d "dist" ]; then
    echo "❌ مجلد dist غير موجود"
    echo "⏳ جاري البناء..."
    npm run build
fi

echo ""
echo "✅ التحديثات الجاهزة للنشر:"
echo "   1. الزر الذكي مدمج"
echo "   2. الزر القديم محذوف"
echo "   3. نظام AI نشط"
echo ""

echo "📦 Build Version: v20251102_1762112917786"
echo ""

echo "🌐 خيارات النشر:"
echo ""
echo "1️⃣  Netlify:"
echo "   netlify deploy --prod --dir=dist"
echo ""
echo "2️⃣  Vercel:"
echo "   vercel --prod"
echo ""
echo "3️⃣  GitHub Pages:"
echo "   git add ."
echo "   git commit -m 'Deploy smart button update'"
echo "   git push origin main"
echo ""
echo "4️⃣  FTP/Hosting:"
echo "   - ارفع محتويات مجلد dist/"
echo ""

echo "📱 بعد النشر:"
echo "   1. امسح الكاش على الموبايل"
echo "   2. أو افتح: /force-update-smart-button.html"
echo "   3. تأكد من ظهور الزر البني الذكي"
echo ""

read -p "هل تريد فتح ملف التعليمات؟ (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cat SMART_BUTTON_UPDATE_AR.md
fi

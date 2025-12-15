#!/bin/bash

echo "🚀 نشر الفوتر الآن..."
echo ""
echo "Version: v20251215_1765836401521"
echo "File: palmolive-footer-fixed.tar.gz"
echo ""
echo "اختر طريقة النشر:"
echo ""
echo "1. Vercel"
echo "2. Netlify"
echo "3. رفع يدوي"
echo ""
read -p "اختر رقم (1/2/3): " choice

case $choice in
  1)
    echo ""
    echo "🔵 النشر على Vercel..."
    cd /tmp/cc-agent/58919512/project
    vercel --prod --force
    echo ""
    echo "✅ تم النشر! افتح موقعك الآن"
    ;;
  2)
    echo ""
    echo "🟢 النشر على Netlify..."
    cd /tmp/cc-agent/58919512/project
    netlify deploy --prod --dir=dist
    echo ""
    echo "✅ تم النشر! افتح موقعك الآن"
    ;;
  3)
    echo ""
    echo "🟡 الملف الجاهز للرفع:"
    echo "palmolive-footer-fixed.tar.gz"
    echo ""
    echo "ارفعه على السيرفر ثم:"
    echo "tar -xzf palmolive-footer-fixed.tar.gz"
    echo "cp -r dist/* /var/www/html/"
    ;;
  *)
    echo "خيار غير صحيح!"
    ;;
esac

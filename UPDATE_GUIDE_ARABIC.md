# 🔄 دليل تحديث الموقع على Hostinger

## المشكلة:
- تغييرات قاعدة البيانات تظهر فوراً
- تغييرات الكود لا تظهر

## الحل (3 خطوات):

### 1. Build جديد:
```bash
npm run build
```

### 2. رفع على Hostinger:
```
1. https://hpanel.hostinger.com
2. File Manager → public_html/
3. احذف كل شيء (Ctrl+A → Delete)
4. ارفع محتوى dist/ كامل
5. انتظر 2-5 دقائق
```

### 3. مسح الكاش:
```
1. Hostinger Dashboard → Cache → Clear Cache
2. شارك مع المستخدمين:
   https://mzad1.com/force-update.html
```

## التحقق:
```
افتح: https://mzad1.com/version-manifest.json
يجب أن يظهر: v20251030_1761822591043
```

## الإصدار الحالي:
```
Version: v20251030_1761822591043
Status: ✅ READY
Files: في dist/ folder
```

**جاهز للنشر!** 🚀

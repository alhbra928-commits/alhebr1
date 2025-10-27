# 🎯 دليل الحصول على معرفات المنصات - Platform IDs Guide

## ✅ تم الإصلاح

```
✓ إضافة validation للتحقق من عدم إدخال روابط
✓ إضافة تعليمات واضحة في واجهة الإدخال
✓ تحسين رسائل الخطأ
✓ إصلاح سياسات RLS لجميع جداول التسويق
✓ السجلات تعمل وتظهر بشكل صحيح
```

---

## 📊 1. Google Analytics (Property ID)

### كيفية الحصول على Property ID

```
الخطوة 1: اذهب إلى
https://analytics.google.com/

الخطوة 2: اختر Property الخاص بك

الخطوة 3: اذهب إلى Admin (⚙️) → Property Settings

الخطوة 4: انسخ Property ID
```

### الشكل الصحيح

```
✅ صحيح:
G-XXXXXXXXX
G-1234567890

❌ خطأ:
https://analytics.google.com/...
UA-XXXXXXX-X (هذا للإصدار القديم)
```

### مثال في المنصة

```
Property ID: G-JKMNXYZ123
```

---

## 🎵 2. TikTok Pixel (Pixel ID)

### كيفية الحصول على Pixel ID

```
الخطوة 1: اذهب إلى TikTok Events Manager
https://ads.tiktok.com/

الخطوة 2: اختر Pixel من القائمة

الخطوة 3: انسخ Pixel ID (يظهر أعلى الصفحة)
```

### الشكل الصحيح

```
✅ صحيح:
CXXXXXXXXXXXXXXX
C1234567890ABCDE

❌ خطأ:
https://www.tiktok.com/@username
https://ads.tiktok.com/...
@username
```

### كيف تحصل على Pixel ID من TikTok Business

```
1. سجل دخول إلى TikTok Ads Manager
2. اضغط على "Assets" → "Events"
3. اختر "Web Events"
4. انقر على "Manage" في Pixel الخاص بك
5. انسخ Pixel ID الموجود في الأعلى
```

### مثال في المنصة

```
Pixel ID: C12KL4M56NOP789Q
```

---

## 📘 3. Meta Pixel (Facebook & Instagram)

### كيفية الحصول على Pixel ID

```
الخطوة 1: اذهب إلى Meta Events Manager
https://business.facebook.com/events_manager

الخطوة 2: اختر Pixel الخاص بك

الخطوة 3: اذهب إلى Settings

الخطوة 4: انسخ Pixel ID
```

### الشكل الصحيح

```
✅ صحيح:
1234567890123456
987654321098765

❌ خطأ:
https://www.facebook.com/...
https://business.facebook.com/...
pixel_XXXXX
```

### مثال في المنصة

```
Pixel ID: 234567890123456
```

---

## 🐦 4. Twitter (X) Pixel

### كيفية الحصول على Pixel ID

```
الخطوة 1: اذهب إلى Twitter Ads Manager
https://ads.twitter.com/

الخطوة 2: اضغط على Tools → Events Manager

الخطوة 3: انسخ Pixel ID
```

### الشكل الصحيح

```
✅ صحيح:
o1234
o5678

❌ خطأ:
https://twitter.com/...
@username
twitter_pixel_XXXXX
```

### مثال في المنصة

```
Pixel ID: o9876
```

---

## ▶️ 5. YouTube Analytics (API Key)

### كيفية الحصول على API Key

```
الخطوة 1: اذهب إلى Google Cloud Console
https://console.cloud.google.com/

الخطوة 2: أنشئ مشروع جديد أو اختر مشروع موجود

الخطوة 3: فعّل YouTube Data API v3

الخطوة 4: اذهب إلى Credentials

الخطوة 5: أنشئ API Key وانسخه
```

### الشكل الصحيح

```
✅ صحيح:
AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ123456
AIzaSy...

❌ خطأ:
https://www.youtube.com/...
https://console.cloud.google.com/...
youtube_api_XXXXX
```

### مثال في المنصة

```
API Key: AIzaSyD1234567890ABCDEFGHIJKLMNOPQRSTUVW
```

---

## 🔍 كيفية اختبار الاتصال

### في واجهة إدارة التسويق

```
1. اذهب إلى: لوحة التحكم → التسويق → إعدادات الربط

2. اضغط على [⚙️] بجانب المنصة

3. أدخل Pixel ID أو API Key الصحيح

4. اضغط [حفظ]

5. اضغط [🔄] لاختبار الاتصال

6. ستظهر نتيجة الاختبار:
   ✅ "نجح الاتصال مع [المنصة]"
   أو
   ❌ "فشل الاتصال: [سبب الخطأ]"
```

### التحقق من السجلات

```
1. اذهب إلى تبويب "حالة الاتصال"

2. ستشاهد سجل كامل بجميع الاختبارات:
   - المنصة
   - الحالة (نجح/فشل)
   - وقت الاستجابة
   - الرسالة
   - التاريخ والوقت

3. استخدم الفلاتر لعرض منصة محددة

4. اضغط [تحديث] لتحديث السجلات
```

---

## ⚠️ أخطاء شائعة

### 1. إدخال رابط بدلاً من الـ ID

```
❌ خطأ:
Pixel ID: https://www.tiktok.com/@alhebr.1?_t=ZS-90truqMtWBs&_r=1

✅ صحيح:
Pixel ID: C12KL4M56NOP789Q
```

**الحل:** أدخل Pixel ID فقط، بدون رابط.

### 2. استخدام معرف قديم

```
❌ خطأ (Google Analytics Universal):
Property ID: UA-123456-1

✅ صحيح (Google Analytics 4):
Property ID: G-XXXXXXXXX
```

**الحل:** تأكد من استخدام GA4 Property ID.

### 3. نسخ ID خاطئ

```
❌ خطأ:
Pixel ID: pixel_C12KL4M56NOP789Q
Pixel ID: @C12KL4M56NOP789Q

✅ صحيح:
Pixel ID: C12KL4M56NOP789Q
```

**الحل:** انسخ الـ ID فقط بدون أي prefix.

### 4. مسافات في البداية أو النهاية

```
❌ خطأ:
"  C12KL4M56NOP789Q  "

✅ صحيح:
"C12KL4M56NOP789Q"
```

**الحل:** احذف المسافات قبل وبعد الـ ID.

---

## 🎓 نصائح مهمة

### 1. تحقق من الصلاحيات

```
✓ تأكد من أن لديك صلاحيات Admin في المنصة
✓ تأكد من أن Pixel/Property نشط (Active)
✓ تأكد من أن الحساب مُفعّل
```

### 2. احتفظ بنسخة من الـ IDs

```
قم بحفظ جميع الـ IDs في مكان آمن:

Google Analytics: G-XXXXXXXXX
TikTok Pixel: C12KL4M56NOP789Q
Meta Pixel: 1234567890123456
Twitter Pixel: o9876
YouTube API: AIzaSy...
```

### 3. اختبر بعد كل تغيير

```
بعد حفظ أي معرف:
1. اضغط [🔄] للاختبار
2. تحقق من السجلات
3. تأكد من ظهور "نجح"
```

### 4. راقب حالة الاتصال

```
في تبويب "حالة الاتصال":
✓ تحقق من آخر فحص
✓ راقب معدل النجاح
✓ راجع أي أخطاء
```

---

## 📞 حل المشاكل

### المشكلة: لا توجد سجلات متاحة

```
الأسباب المحتملة:
1. لم يتم اختبار أي منصة بعد
2. مشكلة في التحميل

الحل:
1. امسح الكاش (Ctrl+Shift+R)
2. اضغط [تحديث] في السجلات
3. قم باختبار أي منصة
4. تحقق من ظهور السجل
```

### المشكلة: فشل الاختبار رغم صحة الـ ID

```
الأسباب المحتملة:
1. المنصة غير نشطة
2. الصلاحيات غير كافية
3. الـ Pixel/Property محذوف

الحل:
1. راجع إعدادات المنصة الأصلية
2. تأكد من نشاط الـ Pixel/Property
3. تحقق من الصلاحيات
4. أعد إنشاء Pixel جديد إذا لزم الأمر
```

### المشكلة: "فشل الحفظ"

```
الأسباب:
1. إدخال رابط بدلاً من ID
2. مشكلة في الاتصال

الحل:
1. تحقق من أنك تدخل ID وليس URL
2. امسح الكاش
3. حاول مرة أخرى
4. راجع Console (F12) للأخطاء
```

---

## ✅ قائمة التحقق النهائية

```
قبل الاختبار، تأكد من:

☑️ لديك صلاحيات Admin في المنصة
☑️ الـ Pixel/Property نشط ومُفعّل
☑️ نسخت الـ ID الصحيح (بدون URL)
☑️ لا توجد مسافات في البداية أو النهاية
☑️ الـ ID من النوع الصحيح (GA4 وليس Universal)
☑️ الحساب مُفعّل ولديه بيانات

بعد الحفظ:

☑️ اضغط [🔄] للاختبار
☑️ تحقق من السجلات
☑️ تأكد من ظهور "نجح"
☑️ راقب البيانات في لوحة التحكم
```

---

## 📚 موارد مفيدة

### روابط رسمية

```
Google Analytics:
https://analytics.google.com/

TikTok Events Manager:
https://ads.tiktok.com/

Meta Events Manager:
https://business.facebook.com/events_manager

Twitter Ads:
https://ads.twitter.com/

Google Cloud Console:
https://console.cloud.google.com/
```

---

**الإصدار:** v2.2.0 (مع Validation)
**تاريخ التحديث:** 2025-10-27
**الحالة:** ✅ جاهز مع التحقق التلقائي
**البناء:** ✅ نجح (8.52s)

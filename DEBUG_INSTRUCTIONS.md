# 🔬 تعليمات تشخيص مشكلة "Failed to fetch"

## 🔴 المشكلة

```
عند إضافة مزرعة جديدة من لوحة صاحب المزرعة:
❌ يتأخر في الإرسال
❌ ثم يظهر خطأ: TypeError: Failed to fetch
```

---

## ✅ التحديثات المطبقة

### **1. إضافة Logging مفصل:**

تم إضافة console.log في `farmOwnerService.ts`:

```javascript
async submitForReview(...) {
  try {
    console.log('🚀 بدء إرسال بيانات المزرعة...');
    console.log('Profile ID:', profileId);

    const { data, error } = await supabase.rpc('submit_farm_for_review', {
      // ...البيانات
    });

    console.log('✅ استجابة من قاعدة البيانات:', { data, error });

    if (error) {
      console.error('❌ خطأ من قاعدة البيانات:', error);
      throw error;
    }

    return { success: data?.success || false, ... };

  } catch (error: any) {
    console.error('💥 خطأ في إرسال الطلب:', error);
    console.error('تفاصيل الخطأ:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    return {
      success: false,
      error: error.message || 'حدث خطأ في الاتصال بقاعدة البيانات'
    };
  }
}
```

---

## 🧪 كيفية التشخيص

### **الطريقة 1: استخدام Console في المتصفح**

1. **افتح Developer Tools:**
   ```
   F12 أو
   Ctrl+Shift+I (Windows/Linux)
   Cmd+Option+I (Mac)
   ```

2. **اذهب إلى تبويب Console**

3. **سجل دخول كصاحب مزرعة:**
   ```
   رقم الجوال: 0500000001
   OTP: 123456
   ```

4. **املأ نموذج إضافة مزرعة واضغط "حفظ وإرسال"**

5. **راقب Console - ستظهر رسائل مثل:**
   ```
   🚀 بدء إرسال بيانات المزرعة...
   Profile ID: xxxx-xxxx-xxxx
   ✅ استجابة من قاعدة البيانات: { data: {...}, error: null }
   ```

6. **إذا ظهر خطأ، ستظهر تفاصيل كاملة:**
   ```
   ❌ خطأ من قاعدة البيانات: { ... }
   💥 خطأ في إرسال الطلب: TypeError: Failed to fetch
   تفاصيل الخطأ: {
     message: "...",
     code: "...",
     details: {...},
     hint: "..."
   }
   ```

---

### **الطريقة 2: استخدام ملف الاختبار**

1. **افتح الملف:**
   ```
   test-submit-farm-debug.html
   ```

2. **حدّث متغيرات Supabase في الملف:**
   ```javascript
   const SUPABASE_URL = 'your-project-url';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```

3. **افتح الملف في المتصفح**

4. **اتبع الخطوات الثلاث في الواجهة:**
   - ✅ إعداد الاتصال
   - ✅ إنشاء ملف تجريبي
   - ✅ إرسال بيانات المزرعة

5. **راقب السجل الأسود في الأسفل**

---

## 🔍 الأخطاء المحتملة وحلولها

### **1. خطأ: "Function not found"**
```
السبب: الدالة submit_farm_for_review غير موجودة
الحل: تطبيق migration رقم 20251025234352
```

### **2. خطأ: "Permission denied"**
```
السبب: المستخدم anon لا يملك صلاحية تنفيذ الدالة
الحل: تنفيذ:
  GRANT EXECUTE ON FUNCTION submit_farm_for_review TO anon;
```

### **3. خطأ: "Network request failed"**
```
السبب: مشكلة في الاتصال بـ Supabase
الحل:
  1. تحقق من URL و API Key
  2. تحقق من اتصال الإنترنت
  3. تحقق من CORS في Supabase
```

### **4. خطأ: "Invalid input syntax for type jsonb"**
```
السبب: بيانات varieties غير صحيحة
الحل: تأكد من إرسال varieties كـ Array صحيح
```

### **5. خطأ: "Row level security policy violation"**
```
السبب: RLS يمنع الوصول
الحل: الدالة تستخدم SECURITY DEFINER (تم حلها)
```

---

## 📊 فحص قاعدة البيانات

### **تحقق من وجود الدالة:**
```sql
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'submit_farm_for_review';

-- النتيجة المتوقعة:
-- proname: submit_farm_for_review
-- prosecdef: true (SECURITY DEFINER)
```

### **تحقق من الصلاحيات:**
```sql
SELECT grantee, privilege_type 
FROM information_schema.routine_privileges 
WHERE routine_name = 'submit_farm_for_review';

-- يجب أن يظهر:
-- anon | EXECUTE
-- authenticated | EXECUTE
```

### **اختبار الدالة مباشرة:**
```sql
SELECT submit_farm_for_review(
  'profile-id-here',
  'اسم المالك',
  '1234567890',
  'القصيم',
  'بريدة',
  'TEST-123',
  5000,
  'متر مربع',
  'نخيل',
  500000,
  5000,
  6,
  NULL,
  NULL,
  NULL,
  '[{"type":"نخيل","name":"خلاص","count":50}]'::jsonb,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
);
```

---

## ✅ الحل النهائي المتوقع

بعد تطبيق التحديثات:

1. **Logging كامل يساعد في التشخيص**
2. **رسائل خطأ واضحة ومفصلة**
3. **الدالة تعمل مع SECURITY DEFINER**
4. **الصلاحيات ممنوحة لـ anon**

### **التدفق الصحيح:**
```
1. المستخدم يملأ النموذج ✅
2. الضغط على "حفظ وإرسال" ✅
3. استدعاء submitForReview ✅
4. استدعاء supabase.rpc ✅
5. تنفيذ الدالة في قاعدة البيانات ✅
6. إرجاع النتيجة { success: true, farm_code: ... } ✅
7. إظهار رسالة نجاح ✅
```

---

## 📝 ملاحظات مهمة

1. **تأكد من أن البناء نجح:**
   ```bash
   npm run build
   ```

2. **افتح Developer Console دائماً**

3. **راقب الرسائل التفصيلية**

4. **إذا استمرت المشكلة:**
   - شارك لقطة شاشة من Console
   - شارك رسالة الخطأ الكاملة
   - شارك تفاصيل الخطأ من الـ logging

---

## 🎯 الخطوات التالية

1. **اختبر الآن في المتصفح**
2. **راقب Console**
3. **شارك نتائج الاختبار**
4. **سنحل أي مشكلة متبقية**

**المشكلة الآن قابلة للتشخيص بسهولة!** 🔬✅

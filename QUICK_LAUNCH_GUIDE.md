# ⚡ دليل الإطلاق السريع - 15 دقيقة

## 🎯 5 خطوات فقط للإطلاق

### الخطوة 1: Environment Variables (دقيقتان)

```bash
# 1. انسخ ملف .env.example
cp .env.example .env

# 2. افتح .env وضع مفاتيحك الحقيقية
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**أين تجد المفاتيح؟**
1. اذهب إلى: https://supabase.com/dashboard
2. اختر مشروعك
3. Settings → API
4. انسخ `Project URL` و `anon public key`

---

### الخطوة 2: Supabase Storage (3 دقائق)

```bash
# في Supabase Dashboard:
# 1. اذهب إلى Storage
# 2. اضغط "Create bucket"
# 3. الاسم: payment-receipts
# 4. Public: No (خاص)
# 5. احفظ
```

**ضبط RLS على Storage:**
```sql
-- في SQL Editor في Supabase:
-- RLS policy للرفع
CREATE POLICY "Users can upload receipts"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'payment-receipts');

-- RLS policy للقراءة (للإدارة فقط)
CREATE POLICY "Admins can view receipts"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'payment-receipts');
```

---

### الخطوة 3: بيانات أولية (5 دقائق)

#### أ) إنشاء Admin رئيسي

```sql
-- في SQL Editor في Supabase:
INSERT INTO admin_users (
  phone,
  name_ar,
  name_en,
  username,
  email,
  role,
  is_super_admin,
  secret_code,
  created_at
) VALUES (
  '0500000000',           -- رقم الجوال
  'المدير العام',         -- الاسم بالعربي
  'System Admin',         -- الاسم بالإنجليزي
  'admin',                -- اسم المستخدم
  'admin@example.com',    -- البريد
  'مدير النظام',          -- الدور
  true,                   -- Super admin
  '1234',                 -- الرمز السري (غيّره!)
  NOW()
);
```

#### ب) إضافة مزرعة تجريبية

```sql
-- أولاً: أضف مالك المزرعة
INSERT INTO farm_owners (
  name_ar,
  name_en,
  phone,
  national_id,
  created_at
) VALUES (
  'محمد أحمد',
  'Mohammed Ahmed',
  '0501234567',
  '1234567890',
  NOW()
) RETURNING id;

-- ثانياً: أضف المزرعة (استخدم الـ id من الخطوة السابقة)
INSERT INTO farms (
  farm_name,
  location,
  total_trees,
  available_trees,
  price_per_tree,
  tree_type,
  status,
  owner_id,
  barcode,
  created_at
) VALUES (
  'مزرعة الخالدية',
  'القصيم',
  5000,
  5000,
  250.00,
  'نخل',
  'active',
  'paste-owner-id-here',  -- ضع الـ id من الخطوة السابقة
  'FARM-2025-0001',
  NOW()
) RETURNING id;

-- ثالثاً: أضف أصناف للمزرعة
INSERT INTO farm_tree_varieties (
  farm_id,
  variety_name,
  variety_type,
  total_trees,
  available_quantity,
  price_per_tree,
  created_at
) VALUES
  ('paste-farm-id-here', 'سكري', 'نخل', 2000, 2000, 250.00, NOW()),
  ('paste-farm-id-here', 'خلاص', 'نخل', 1500, 1500, 250.00, NOW()),
  ('paste-farm-id-here', 'برحي', 'نخل', 1500, 1500, 250.00, NOW());
```

#### ج) إعدادات Ticker

```sql
-- إضافة عناصر للشريط المتحرك
INSERT INTO ticker_items (
  content,
  type,
  is_active,
  display_order
) VALUES
  ('مرحباً بكم في منصة النخلة والزيتون', 'announcement', true, 1),
  ('استثمر في الزراعة بثقة', 'announcement', true, 2),
  ('فرص استثمارية متميزة', 'announcement', true, 3);

-- إعدادات Ticker
INSERT INTO ticker_settings (
  is_enabled,
  animation_speed,
  pause_on_hover
) VALUES (true, 30, true);
```

---

### الخطوة 4: Build & Deploy (3 دقيقة)

```bash
# 1. بناء المشروع
npm run build

# 2. تحقق من النجاح
# يجب أن ترى: ✓ built in X.XXs

# 3. Deploy
# رفع محتويات مجلد dist/ إلى hosting الخاص بك
# (Vercel, Netlify, أو أي hosting آخر)
```

**خيارات Hosting الموصى بها:**
- **Vercel**: سهل وسريع (موصى به)
- **Netlify**: بديل ممتاز
- **GitHub Pages**: مجاني

---

### الخطوة 5: اختبار سريع (دقيقتان)

#### ✅ Checklist الاختبار السريع:

```bash
# 1. افتح المنصة في المتصفح
[ ] الصفحة الرئيسية تعمل
[ ] المزارع تظهر
[ ] يمكنك النقر على مزرعة

# 2. اختبار تسجيل دخول الإدارة
[ ] اذهب إلى /admin (أو انقر على التاج 👑)
[ ] سجل دخول: 0500000000 / 1234
[ ] لوحة الإدارة تفتح

# 3. اختبار الأقسام
[ ] افتح قسم المزارع
[ ] افتح قسم الحجوزات
[ ] افتح قسم المستثمرين

# 4. اختبار على الجوال
[ ] افتح من جوالك
[ ] تأكد من التجاوب الصحيح
[ ] اختبر اللمس والتمرير
```

---

## 🚀 الإطلاق!

**إذا نجحت الاختبارات أعلاه، منصتك جاهزة 100%!**

### ما بعد الإطلاق:

#### اليوم الأول:
- راقب Console logs للأخطاء
- تابع المستخدمين الأوائل
- اجمع الملاحظات

#### الأسبوع الأول:
- راقب الأداء
- أصلح أي مشاكل عاجلة
- حسّن بناءً على الملاحظات

#### الشهر الأول:
- أضف features جديدة
- حسّن الأداء
- وسّع نطاق المنصة

---

## 🆘 استكشاف الأخطاء

### مشكلة: "Failed to fetch"
```bash
# الحل:
# 1. تحقق من .env
# 2. تأكد من VITE_SUPABASE_URL صحيح
# 3. تأكد من VITE_SUPABASE_ANON_KEY صحيح
```

### مشكلة: "Permission denied"
```sql
-- الحل: تحقق من RLS policies
SELECT * FROM admin_users WHERE phone = '0500000000';

-- إذا لم يظهر شيء، أعد إضافة Admin
```

### مشكلة: "Storage bucket not found"
```bash
# الحل:
# 1. اذهب إلى Supabase Dashboard → Storage
# 2. أنشئ bucket: payment-receipts
# 3. ضبط RLS policies
```

### مشكلة: الصور لا تظهر
```bash
# الحل:
# 1. تحقق من مسارات الصور
# 2. استخدم stock photos من Pexels
# 3. أو أضف صور المزارع الحقيقية
```

---

## 📱 اختبار على الأجهزة

### على iPhone:
```bash
# 1. افتح Safari
# 2. اذهب إلى موقعك
# 3. اختبر:
   - اللمس يعمل
   - لا يوجد zoom عند التركيز
   - التمرير سلس
   - الأزرار قابلة للنقر
```

### على Android:
```bash
# 1. افتح Chrome
# 2. اذهب إلى موقعك
# 3. اختبر نفس النقاط
```

### على Desktop:
```bash
# 1. Chrome DevTools (F12)
# 2. Toggle device toolbar
# 3. اختبر جميع الشاشات:
   - iPhone SE (375px)
   - iPhone 12 (390px)
   - iPad (768px)
```

---

## 🎯 نصيحة ذهبية

**اعمل Backup كامل قبل أي شيء!**

```sql
-- في Supabase Dashboard:
-- 1. Database → Backups
-- 2. Create backup now
-- 3. احفظ نسخة محلية

-- أو استخدم:
pg_dump --host=your-host --port=5432 --username=postgres --dbname=postgres > backup.sql
```

---

## ✨ مبروك!

**منصتك الآن جاهزة ومُطلقة! 🎉**

### خطوات إضافية (اختيارية):

1. **أضف Google Analytics**
2. **أضف Favicon مخصص**
3. **أضف Meta tags للـ SEO**
4. **شارك الرابط!**

---

## 📞 تذكير أخير

- ✅ مفاتيح Supabase صحيحة
- ✅ Storage bucket موجود
- ✅ Admin user موجود
- ✅ مزرعة واحدة على الأقل
- ✅ Backup جاهز
- ✅ اختبار شامل

**إذا كل النقاط أعلاه ✅، أنت جاهز 100%!**

**Good luck! 🚀**

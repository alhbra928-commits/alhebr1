# 🌳 نظام المزارع المتعددة - دليل كامل

## 📋 نظرة عامة

تم تطوير النظام بنجاح لدعم **عدة مزارع** لكل صاحب مزرعة، مع إمكانية إدارتها جميعاً من لوحة تحكم واحدة.

---

## ✅ التحديثات المنفذة

### 1️⃣ قاعدة البيانات (Database)

#### **أ. إعادة هيكلة جدول `farms`**
تم تحديث الجدول ليشمل:
```sql
- owner_id              → ربط المزرعة بصاحبها
- deed_number           → رقم الصك
- total_farm_area       → المساحة الكلية
- farm_area_unit        → وحدة المساحة
- actual_total_price    → السعر الإجمالي
- price_per_tree        → سعر الشجرة
- payment_grace_period  → فترة السماح
- additional_notes      → ملاحظات إضافية
- submission_status     → حالة الطلب (draft/pending/approved/rejected)
```

#### **ب. تحديث `farm_submission_requests`**
```sql
- farm_id → ربط الطلب بالمزرعة بدلاً من الملف الشخصي
```

#### **ج. تحديث `farm_owner_varieties`**
```sql
- farm_id → ربط الأصناف بالمزرعة بدلاً من الملف الشخصي
```

#### **د. الـ Indexes للأداء**
```sql
CREATE INDEX idx_farms_owner_id ON farms(owner_id);
CREATE INDEX idx_farm_submissions_farm_id ON farm_submission_requests(farm_id);
CREATE INDEX idx_farm_varieties_farm_id ON farm_owner_varieties(farm_id);
```

---

### 2️⃣ دالة `submit_farm_for_review` المحدّثة

**الميزات الجديدة:**

✅ **دعم معامل `p_farm_id` الاختياري:**
- إذا كان `NULL` → إنشاء مزرعة جديدة
- إذا كان موجوداً → تحديث مزرعة موجودة

✅ **توليد كود فريد لكل مزرعة:**
```
FM-XXXXXX (مثال: FM-123456)
```

✅ **ربط الطلب بالمزرعة:**
- كل طلب مرتبط بـ `farm_id` محدد
- الأصناف مرتبطة بـ `farm_id`

✅ **الإشعارات:**
- إرسال إشعار لصاحب المزرعة عند إرسال الطلب بنجاح

---

### 3️⃣ خدمة `farmOwnerService` المحدّثة

**الدوال الجديدة:**

```typescript
// جلب جميع مزارع صاحب المزرعة
async getOwnerFarms(profileId: string): Promise<Farm[]>

// جلب تفاصيل مزرعة محددة
async getFarm(farmId: string): Promise<Farm | null>

// تحديث submitForReview لدعم farm_id
async submitForReview(profileId, formData): Promise<{
  success: boolean;
  submission_id?: string;
  farm_id?: string;
  farm_code?: string;
  total_trees?: number;
  message?: string;
  error?: string;
}>
```

---

### 4️⃣ واجهة `MultiFarmManager` الجديدة

**المكونات:**

#### **أ. عرض قائمة المزارع (Farms Grid)**
- عرض جميع المزارع في شبكة (Grid)
- كل بطاقة تحتوي على:
  - كود المزرعة
  - نوع الأشجار
  - الموقع (المنطقة والمدينة)
  - عدد الأشجار الإجمالي والمحجوز
  - نسبة البيع (Progress Bar)
  - السعر الإجمالي
  - تاريخ الإضافة
  - حالة الطلب (Badge)
  - أزرار التعديل والعرض

#### **ب. حالة الطلب (Status Badges)**
```
⏰ قيد المراجعة    (Pending)   - برتقالي
✅ معتمدة          (Approved)  - أخضر
❌ مرفوضة         (Rejected)  - أحمر
✏️ مسودة          (Draft)     - رمادي
```

#### **ج. زر "إضافة مزرعة جديدة"**
- موجود في الأعلى
- ينقل للنموذج مباشرة

#### **د. حالة فارغة (Empty State)**
- رسالة ترحيبية مع أيقونة
- زر لإضافة أول مزرعة

#### **هـ. بطاقة الإحصائيات العامة**
```
📊 إحصائيات عامة:
- عدد المزارع
- إجمالي الأشجار
- الأشجار المحجوزة
- المزارع المعتمدة
```

---

### 5️⃣ تحديث `SmartFarmDataForm`

**الإضافات:**

```typescript
interface SmartFarmDataFormProps {
  profileId: string;
  onSuccess: () => void;
  initialData?: any;
  farmId?: string;  // ← جديد: لدعم التعديل
}
```

**السلوك:**
- إذا كان `farmId` موجوداً → تحديث المزرعة
- إذا كان `farmId` فارغاً → إنشاء مزرعة جديدة

---

### 6️⃣ تحديث `FarmOwnerDashboard`

**التبويبات الجديدة:**

```tsx
const tabs = [
  { id: 'home', label: 'الرئيسية', icon: Home },
  { id: 'farms', label: 'مزارعي', icon: Layers },  // ← جديد
  { id: 'form', label: 'بياناتي', icon: FileText },
  { id: 'finance', label: 'المالية', icon: DollarSign },
  { id: 'notifications', label: 'الإشعارات', icon: Bell },
  { id: 'support', label: 'تواصل', icon: Phone },
  { id: 'faq', label: 'الأسئلة', icon: HelpCircle }
]
```

---

## 🎯 كيفية الاستخدام

### **للمستخدم:**

1️⃣ **الدخول إلى لوحة صاحب المزرعة**
   - تسجيل الدخول برقم الجوال

2️⃣ **الذهاب إلى تبويب "مزارعي"**
   - عرض جميع المزارع

3️⃣ **إضافة مزرعة جديدة**
   - الضغط على "إضافة مزرعة جديدة"
   - ملء النموذج
   - الضغط على "حفظ وإرسال"

4️⃣ **تعديل مزرعة موجودة**
   - الضغط على "تعديل" في بطاقة المزرعة
   - تعديل البيانات
   - الضغط على "حفظ وإرسال"

5️⃣ **متابعة الحالة**
   - مشاهدة حالة الطلب في البطاقة
   - استلام إشعار عند الموافقة/الرفض

---

### **للمطور:**

#### **إضافة مزرعة جديدة:**
```typescript
const result = await farmOwnerService.submitForReview(profileId, {
  full_name: '...',
  national_id: '...',
  region: '...',
  city: '...',
  deed_number: '...',
  total_farm_area: 1000,
  farm_area_unit: 'متر',
  farm_type: 'نخيل',
  actual_total_price: 500000,
  price_per_tree: 1000,
  payment_grace_period: 6,
  varieties: [
    { type: 'نخيل', name: 'سكري', count: 100 }
  ]
  // farm_id: undefined ← لإنشاء مزرعة جديدة
});
```

#### **تعديل مزرعة موجودة:**
```typescript
const result = await farmOwnerService.submitForReview(profileId, {
  // ... نفس البيانات
  farm_id: 'existing-farm-id'  // ← لتحديث مزرعة موجودة
});
```

#### **جلب جميع المزارع:**
```typescript
const farms = await farmOwnerService.getOwnerFarms(profileId);
```

#### **جلب مزرعة محددة:**
```typescript
const farm = await farmOwnerService.getFarm(farmId);
```

---

## 📊 مثال على البيانات

### **بعد إضافة مزرعة:**
```json
{
  "success": true,
  "submission_id": "uuid-123",
  "farm_id": "uuid-456",
  "farm_code": "FM-123456",
  "total_trees": 150,
  "message": "تم إرسال الطلب بنجاح"
}
```

### **بيانات المزرعة:**
```json
{
  "id": "uuid-456",
  "farm_code": "FM-123456",
  "owner_id": "uuid-owner",
  "region_ar": "القصيم",
  "city_ar": "بريدة",
  "tree_type_ar": "نخيل",
  "total_trees": 150,
  "reserved_trees": 50,
  "available_trees": 100,
  "actual_total_price": 150000,
  "submission_status": "pending",
  "status": "قيد المراجعة",
  "created_at": "2025-10-25T..."
}
```

---

## 🎨 التصميم

### **الألوان المستخدمة:**

```css
/* تبويب "مزارعي" */
--farms-color: #8BC34A;
--farms-gradient: linear-gradient(135deg, #8BC34A, #689F38);

/* حالات الطلب */
--pending: #F59E0B;   /* برتقالي */
--approved: #10B981;  /* أخضر */
--rejected: #EF4444;  /* أحمر */
--draft: #6B7280;     /* رمادي */

/* الأزرار */
--primary-btn: linear-gradient(135deg, #8BC34A, #689F38);
--edit-btn: #3B82F6;  /* أزرق */
--view-btn: #10B981;  /* أخضر */
```

---

## 🔒 الأمان (RLS Policies)

جميع الجداول محمية بـ RLS:

```sql
-- farms: الوصول حسب owner_id
-- farm_submission_requests: الوصول حسب profile_id و farm_id
-- farm_owner_varieties: الوصول حسب profile_id و farm_id
```

---

## ⚡ الأداء

- **Indexes** على جميع الأعمدة الهامة
- تحميل البيانات بشكل متوازي
- Caching في localStorage للجلسة

---

## 🚀 الخطوات القادمة (اقتراحات)

1️⃣ **إضافة فلتر في قائمة المزارع:**
   - حسب الحالة
   - حسب نوع الأشجار
   - حسب التاريخ

2️⃣ **إضافة بحث:**
   - بكود المزرعة
   - بالمنطقة

3️⃣ **إضافة إحصائيات متقدمة:**
   - رسوم بيانية
   - مقارنة بين المزارع

4️⃣ **إضافة صفحة تفاصيل المزرعة:**
   - عرض جميع البيانات
   - تاريخ التحديثات
   - الحجوزات المرتبطة

5️⃣ **إضافة صلاحية حذف المزرعة:**
   - Soft Delete
   - مع تأكيد

---

## 🎉 النتيجة النهائية

✅ **صاحب المزرعة الآن يستطيع:**
- إضافة عدة مزارع
- تعديل كل مزرعة بشكل مستقل
- متابعة حالة كل مزرعة
- عرض إحصائيات شاملة
- إدارة كل شيء من مكان واحد

✅ **النظام:**
- مرن وقابل للتوسع
- آمن ومحمي
- سريع ومحسّن
- سهل الاستخدام

---

## 📝 ملاحظات مهمة

1. كل مزرعة لها **كود فريد** خاص بها
2. الطلبات تُرفع **بشكل مستقل** لكل مزرعة
3. الأصناف مرتبطة **بالمزرعة** وليس بالملف الشخصي
4. المعلومات الشخصية (الاسم، الهوية، البنك) تُحدّث **مرة واحدة** في `farm_owner_profiles`

---

تم التطوير بنجاح! 🎊

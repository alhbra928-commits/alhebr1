# 🎯 بطاقة صاحب المزرعة المتطورة - التوثيق الكامل

## 📋 نظرة عامة

تم تطوير **بطاقة صاحب المزرعة المتطورة ثلاثية الأبعاد** (AdvancedOwnerCard3D) لعرض جميع بيانات أصحاب المزارع بشكل فاخر واحترافي في قسم إدارة أصحاب المزارع.

---

## ✨ المميزات الرئيسية

### 🎨 التصميم الفاخر
- ✅ **بطاقة ثلاثية الأبعاد** مع تأثيرات Hover متقدمة
- ✅ **خلفيات متحركة** وتدرجات لونية ديناميكية
- ✅ **أيقونات ملونة** مع تدرجات مخصصة لكل نوع بيانات
- ✅ **انتقالات سلسة** وتأثيرات بصرية احترافية

### 📊 عرض البيانات الكامل

#### 1️⃣ **القسم الرئيسي (Header)**
- صورة رمزية فاخرة مع شارة الحالة
- الاسم الكامل
- رقم الجوال
- البريد الإلكتروني (إن وُجد)
- المدينة والمنطقة
- تاريخ الإضافة

#### 2️⃣ **إحصائيات المزرعة (Farm Stats)**
عرض دائم مباشر تحت الهيدر:
- 🌴 **نوع المزرعة**: نخيل / زيتون / مختلط
- 📐 **المساحة**: بالوحدات المناسبة (متر مربع / هكتار / دونم)
- 💰 **السعر الفعلي**: بالريال السعودي
- ⏰ **مهلة السداد**: بالأيام

#### 3️⃣ **التفاصيل الموسعة (Expandable Details)**
تظهر عند الضغط على زر التوسيع:

##### 🗺️ **موقع المزرعة**
- المنطقة
- المدينة
- وصف الموقع التفصيلي

##### 📄 **المستندات القانونية**
- رقم الصك

##### 📝 **الملاحظات الإدارية**
- ملاحظات خاصة من الإدارة

##### 🛡️ **معلومات التجميد** (إن كان مجمداً)
- سبب التجميد
- تاريخ التجميد
- المسؤول عن التجميد

##### ⚙️ **معلومات النظام**
- تاريخ الإضافة
- آخر تحديث

---

## 🎭 حالات العرض

### ✅ نشط (Active)
- **اللون**: أخضر
- **الأيقونة**: CheckCircle
- **التدرج**: `from-green-500 to-emerald-600`

### ❄️ مجمد (Frozen)
- **اللون**: أزرق
- **الأيقونة**: Snowflake
- **التدرج**: `from-blue-500 to-cyan-600`
- **معلومات إضافية**: سبب وتاريخ التجميد

### ⚠️ غير محدد (Other)
- **اللون**: رمادي
- **الأيقونة**: AlertCircle
- **التدرج**: `from-gray-500 to-gray-600`

---

## 🔧 الإجراءات المتاحة

### 1. ✏️ **تعديل** (Edit)
- متاح حسب صلاحيات المستخدم
- زر أزرق مع أيقونة قلم
- يفتح نافذة التعديل

### 2. 🗑️ **حذف** (Delete)
- متاح حسب صلاحيات المستخدم
- زر أحمر مع أيقونة سلة مهملات
- يطلب تأكيد قبل الحذف

### 3. 🔽 **توسيع/طي** (Expand/Collapse)
- متاح دائماً لجميع المستخدمين
- زر ذهبي مع سهم
- يعرض/يخفي التفاصيل الإضافية

---

## 🎯 البيانات المعروضة بالكامل

```typescript
interface FarmOwner {
  // المعلومات الأساسية
  id: string;
  full_name: string;
  mobile_number: string;
  email?: string;
  region: string;
  city: string;

  // بيانات المزرعة
  farm_type: string;          // نوع المزرعة
  farm_area: number;          // المساحة
  farm_area_unit: string;     // وحدة المساحة
  actual_price: number;       // السعر
  payment_grace_period: number; // مهلة السداد

  // موقع المزرعة
  farm_location_region: string;
  farm_location_city: string;
  farm_location_description?: string;

  // المستندات
  deed_number: string;        // رقم الصك

  // الإدارة
  admin_notes?: string;
  status: 'active' | 'frozen' | 'archived';

  // التجميد
  frozen_at?: string;
  frozen_by?: string;
  frozen_reason?: string;

  // النظام
  created_at: string;
  updated_at: string;
}
```

---

## 🎨 الألوان والتدرجات

### 📞 **معلومات الاتصال**
- الهاتف: `from-blue-500 to-cyan-600`
- البريد: `from-purple-500 to-pink-600`
- الموقع: `from-green-500 to-emerald-600`
- التاريخ: `from-amber-500 to-orange-600`

### 📊 **إحصائيات المزرعة**
- نوع المزرعة: `from-amber-500 to-orange-600`
- المساحة: `from-blue-500 to-cyan-600`
- السعر: `from-green-500 to-emerald-600`
- مهلة السداد: `from-purple-500 to-pink-600`

### 🔧 **أزرار الإجراءات**
- تعديل: `from-blue-500 to-cyan-600`
- حذف: `from-red-500 to-pink-600`
- توسيع: `from-amber-500 to-orange-600`

---

## 💫 التأثيرات الخاصة

### 1. **Hover Effects**
- تكبير بسيط (`hover:scale-110`)
- ظلال متقدمة (`hover:shadow-3xl`)
- تدوير الأيقونات (`hover:rotate-12`)
- تغيير الحدود (`hover:border-amber-300`)

### 2. **Animations**
- `animate-pulse`: نبض للخلفيات
- `animate-bounce-gentle`: حركة خفيفة للشارات
- `animate-fade-in`: ظهور تدريجي للتفاصيل

### 3. **3D Perspective**
```css
transform: perspective(1000px);
transform-style: preserve-3d;
```

---

## 📱 التجاوب (Responsive)

### Desktop (lg)
- عرض كامل لجميع الأقسام
- Grid بـ 4 أعمدة للإحصائيات
- Grid بـ 2 أعمدة للتفاصيل

### Tablet (md)
- عرض مناسب مع تقليل الأعمدة
- Grid بـ 2 أعمدة للإحصائيات

### Mobile (sm)
- عرض عمود واحد
- تقليل أحجام الأيقونات
- إخفاء بعض النصوص الثانوية

---

## 🔐 الصلاحيات

البطاقة تحترم صلاحيات المستخدم:

```typescript
hasEditPermission?: boolean;   // إظهار زر التعديل
hasDeletePermission?: boolean;  // إظهار زر الحذف
```

---

## 🚀 الاستخدام

```tsx
import { AdvancedOwnerCard3D } from './AdvancedOwnerCard3D';

<AdvancedOwnerCard3D
  owner={ownerData}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onViewDetails={handleViewDetails}
  hasEditPermission={canEdit}
  hasDeletePermission={canDelete}
/>
```

---

## 🎯 مثال على البيانات

```typescript
const ownerExample = {
  id: "uuid-123",
  full_name: "عمر إبراهيم",
  mobile_number: "0501234567",
  email: "omar@example.com",
  region: "الرياض",
  city: "الرياض",
  farm_type: "نخيل",
  farm_area: 5000,
  farm_area_unit: "متر مربع",
  actual_price: 500000,
  payment_grace_period: 30,
  farm_location_region: "القصيم",
  farm_location_city: "بريدة",
  farm_location_description: "مزرعة على طريق القصيم السريع",
  deed_number: "123456789",
  admin_notes: "مالك مميز",
  status: "active",
  created_at: "2025-01-15T10:00:00Z",
  updated_at: "2025-01-15T10:00:00Z"
};
```

---

## ✅ الخلاصة

البطاقة الجديدة توفر:
- ✨ **عرض فاخر واحترافي** لجميع بيانات صاحب المزرعة
- 📊 **معلومات شاملة** منظمة بشكل منطقي
- 🎨 **تصميم ثلاثي الأبعاد** مع تأثيرات متقدمة
- 🔧 **إجراءات سريعة** مدمجة في البطاقة
- 📱 **متجاوب بالكامل** مع جميع الشاشات
- 🔐 **احترام الصلاحيات** بشكل كامل

---

**تم التطوير بواسطة**: نظام إدارة المزارع المتقدم
**تاريخ الإنشاء**: 25 أكتوبر 2025
**الإصدار**: 1.0.0

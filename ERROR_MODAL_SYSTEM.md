# 🚨 نظام الإشعارات المتطور - Error Modal System

## نظرة عامة

تم تطوير نظام إشعارات متطور لعرض الأخطاء والمشاكل بشكل احترافي مع إمكانية نسخ جميع التفاصيل.

## ✨ المميزات

### 1. واجهة مستخدم احترافية
- 🎨 تصميم عصري بألوان تتناسب مع نوع الخطأ
- ⚡ رسوم متحركة سلسة للظهور والإخفاء
- 📱 متجاوب مع جميع الشاشات
- 🌐 دعم كامل للغة العربية (RTL)

### 2. أنواع الأخطاء المدعومة

#### 🟡 Validation Errors (أخطاء التحقق من البيانات)
- لون: Amber/Yellow
- يظهر عند عدم ملء الحقول المطلوبة
- يعرض قائمة تفصيلية بالحقول الناقصة مقسمة حسب الأقسام

#### 🔴 Database Errors (أخطاء قاعدة البيانات)
- لون: Red
- يظهر عند فشل العمليات مع قاعدة البيانات
- يعرض التفاصيل التقنية الكاملة مع الـ Stack Trace

#### 🔵 Network Errors (أخطاء الشبكة)
- لون: Blue
- يظهر عند مشاكل الاتصال بالإنترنت

#### ⚪ General Errors (أخطاء عامة)
- لون: Gray
- للأخطاء الأخرى

### 3. المعلومات المعروضة

#### ✅ معلومات أساسية
- عنوان الخطأ
- وصف تفصيلي بالعربية
- قائمة بالحقول الناقصة (إن وجدت)
- وقت حدوث الخطأ

#### 🔧 معلومات تقنية (قابلة للإظهار/الإخفاء)
- رسالة الخطأ التقنية
- Stack Trace
- البيانات المرسلة
- Timestamp

### 4. نسخ التقرير الكامل

زر متطور لنسخ جميع التفاصيل بتنسيق احترافي:

```
═══════════════════════════════════════════════════
📋 تقرير تفصيلي عن المشكلة
═══════════════════════════════════════════════════

📌 العنوان: [عنوان الخطأ]

📝 الوصف:
[وصف المشكلة]

⚠️ الحقول الناقصة:

📂 البيانات الأساسية:
   • اسم المزرعة
   • صاحب المزرعة

📂 التفاصيل الزراعية:
   • عدد الأشجار

🔧 التفاصيل التقنية:
[التفاصيل التقنية الكاملة]

⏰ وقت الخطأ: [التاريخ والوقت]

═══════════════════════════════════════════════════
💡 نصيحة: انسخ هذا التقرير وأرسله للدعم الفني
═══════════════════════════════════════════════════
```

## 🎯 كيفية الاستخدام

### 1. Import المكون

```typescript
import { ErrorModal } from '../../../components/common/ErrorModal';
```

### 2. إضافة State

```typescript
const [errorModal, setErrorModal] = useState({
  isOpen: false,
  title: '',
  message: '',
  technicalDetails: '',
  errorType: 'general' as 'validation' | 'database' | 'network' | 'general',
  missingFields: [] as { section: string; fields: string[] }[]
});
```

### 3. عرض الخطأ

#### مثال: Validation Error
```typescript
setErrorModal({
  isOpen: true,
  title: '⚠️ خطأ في التحقق من البيانات',
  message: 'يوجد حقول مطلوبة لم يتم ملؤها',
  technicalDetails: `Section: ${tabName}\nMissing Fields: ${fields.join(', ')}`,
  errorType: 'validation',
  missingFields: [{
    section: 'البيانات الأساسية',
    fields: ['اسم المزرعة', 'رقم الصك']
  }]
});
```

#### مثال: Database Error
```typescript
setErrorModal({
  isOpen: true,
  title: '❌ خطأ في قاعدة البيانات',
  message: 'حدث خطأ أثناء حفظ البيانات',
  technicalDetails: `Error: ${error.message}\nStack: ${error.stack}`,
  errorType: 'database',
  missingFields: []
});
```

### 4. إضافة المكون في JSX

```tsx
<ErrorModal
  isOpen={errorModal.isOpen}
  onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
  title={errorModal.title}
  message={errorModal.message}
  technicalDetails={errorModal.technicalDetails}
  errorType={errorModal.errorType}
  missingFields={errorModal.missingFields}
/>
```

## 📁 الملفات

- `/src/components/common/ErrorModal.tsx` - المكون الرئيسي
- `/src/modules/farms/components/FarmFormModal.tsx` - مثال للاستخدام

## 🎨 التخصيص

يمكنك تخصيص:
- الألوان في الـ `getStyles()` function
- تنسيق التقرير في الـ `formatErrorReport()` function
- الأيقونات المستخدمة
- الرسوم المتحركة

## 🔍 فوائد النظام

1. **للمستخدم:**
   - فهم واضح للمشكلة
   - معرفة الحقول الناقصة بالضبط
   - نسخ سهل للتقرير

2. **للدعم الفني:**
   - تقرير شامل بجميع التفاصيل
   - معلومات تقنية كاملة للمطورين
   - Timestamp دقيق

3. **للمطورين:**
   - سهل الاستخدام والتكامل
   - نظام types آمن
   - قابل للتوسع

## ✅ الحالات المدعومة

- ✅ حقول ناقصة في نموذج إضافة مزرعة
- ✅ أخطاء قاعدة البيانات (Constraints)
- ✅ أخطاء الشبكة
- ✅ أخطاء عامة
- ✅ عرض Stack Trace
- ✅ عرض البيانات المرسلة

## 🚀 التحسينات المستقبلية

- [ ] إضافة أزرار للإجراءات السريعة
- [ ] دعم أنواع أخطاء إضافية
- [ ] تصدير التقرير كملف
- [ ] إرسال التقرير للدعم مباشرة
- [ ] سجل الأخطاء التاريخية

---

تم التطوير بواسطة: AI Assistant
التاريخ: 2025-10-20

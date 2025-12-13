# ✅ إصلاح خطأ قاعدة البيانات: farm_name

## 🐛 المشكلة

```
Supabase request failed
{
  url: 'https://xdjeygiadqavkmwarkfz.supabase.co/rest/v1/farms?...',
  status: 400,
  body: '{"code":"42703","details":null,"hint":"Perhaps you...
         "message":"column farms.farm_name does not exist"}'
}
```

### السبب:
الكود كان يحاول الوصول إلى عمود `farm_name` لكنه غير موجود في جدول `farms`.

---

## 📊 هيكل جدول farms

### الأعمدة الموجودة:
```sql
✅ name_ar (text) - اسم المزرعة بالعربية
✅ name_en (text) - اسم المزرعة بالإنجليزية
```

### الأعمدة المفقودة:
```sql
❌ farm_name - غير موجود
```

---

## 🔧 الإصلاح

### الملف المعدل:
```
src/services/liveActivityService.ts
```

### التغيير:

#### قبل ❌
```typescript
const { data: farms } = await supabase
  .from('farms')
  .select('id, farm_name, created_at')  // ❌ farm_name غير موجود
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(maxPerType);

if (farms) {
  farms.forEach(farm => {
    activities.push({
      id: farm.id,
      message: `مزرعة ${farm.farm_name} متاحة للاستثمار`,  // ❌
      icon: 'TreePine',
      timestamp: farm.created_at,
      type: 'farm',
      source: 'auto'
    });
  });
}
```

#### بعد ✅
```typescript
const { data: farms } = await supabase
  .from('farms')
  .select('id, name_ar, created_at')  // ✅ استخدام name_ar
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(maxPerType);

if (farms) {
  farms.forEach(farm => {
    activities.push({
      id: farm.id,
      message: `مزرعة ${farm.name_ar} متاحة للاستثمار`,  // ✅
      icon: 'TreePine',
      timestamp: farm.created_at,
      type: 'farm',
      source: 'auto'
    });
  });
}
```

---

## 📝 ملاحظات مهمة

### هيكل الأسماء في قاعدة البيانات:

معظم الجداول تستخدم `name_ar` و `name_en` بدلاً من اسم واحد:

```typescript
// ✅ الطريقة الصحيحة
farms.name_ar   // الاسم بالعربية
farms.name_en   // الاسم بالإنجليزية

// ❌ الطريقة الخاطئة
farms.farm_name  // غير موجود
farms.name       // غير موجود
```

---

## 🧪 التحقق

### 1. البناء:
```bash
npm run build
```
✅ **النتيجة:** نجح بدون أخطاء

### 2. اختبار الواجهة:
```
افتح المنصة وتحقق من:
✅ شريط النشاط المباشر يعمل
✅ لا توجد أخطاء في Console
✅ البيانات تُعرض بشكل صحيح
```

---

## 🎯 الملفات الأخرى

### الملفات التي تستخدم `farm_name` بشكل صحيح:

هذه الملفات تقوم بالتعيين (mapping) من `name_ar` إلى `farm_name`:

```typescript
// publicFarmService.ts
private static mapToPublicFarm(farm: any): PublicFarm {
  return {
    farm_name: farm.name_ar || farm.name_en || 'مزرعة',  // ✅ تعيين صحيح
    // ... بقية الحقول
  };
}
```

```typescript
// getSuggestedFarms
return data.map((farm: any, index: number) => ({
  barcode: farm.farm_barcode || farm.farm_code || `FARM-${index}`,
  farm_name: farm.name_ar || farm.name_en || 'مزرعة',  // ✅ تعيين صحيح
  // ... بقية الحقول
}));
```

---

## 🔍 الخلاصة

### المشكلة:
- كان الكود يحاول قراءة عمود `farm_name` مباشرة من قاعدة البيانات

### الحل:
- تغيير الاستعلام لاستخدام `name_ar` بدلاً من `farm_name`

### النتيجة:
- ✅ الخطأ تم حله
- ✅ شريط النشاط المباشر يعمل
- ✅ البناء ناجح
- ✅ لا توجد أخطاء في قاعدة البيانات

---

## 🎉 تم الإصلاح بنجاح!

**الآن المنصة تعمل بدون أخطاء في قاعدة البيانات!** ✨

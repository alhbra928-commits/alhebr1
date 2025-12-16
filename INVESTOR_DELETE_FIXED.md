# ✅ تم إصلاح مشكلة حذف المستثمرين

## المشكلة

عند محاولة حذف مستثمر من إدارة المستثمرين، كان يظهر الخطأ التالي:
```
حدث خطأ: DISTINCT specified, but recalculate_farm_finances_excluding_deleted is not an aggregate function
```

## السبب

في migration file `20251216025404_fix_financial_calculations_exclude_deleted_investors.sql`، السطر 111 كان يحتوي على كود خاطئ:

```sql
PERFORM recalculate_farm_finances_excluding_deleted(DISTINCT farm_id)
FROM reservations
WHERE customer_name = OLD.full_name
```

**المشكلة:** لا يمكن استخدام `DISTINCT farm_id` كمعامل مباشر للدالة.

## الحل

تم إنشاء migration جديد `20251216030500_fix_investor_delete_trigger.sql` يحل المشكلة:

### الكود الصحيح

```sql
CREATE OR REPLACE FUNCTION trigger_recalc_finances_on_investor_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_farm_id UUID;
BEGIN
  -- المرور على جميع المزارع التي لها حجوزات من هذا المستثمر
  FOR v_farm_id IN 
    SELECT DISTINCT farm_id
    FROM reservations
    WHERE customer_name = OLD.full_name
      AND deleted_at IS NULL
      AND booking_status = 'documented'
  LOOP
    -- إعادة حساب المبالغ المالية لكل مزرعة
    PERFORM recalculate_farm_finances_excluding_deleted(v_farm_id);
  END LOOP;
  
  RETURN OLD;
END;
$$;
```

## كيف يعمل الآن؟

1. عند حذف مستثمر (soft delete)
2. يتم تفعيل trigger `trigger_update_finances_on_investor_delete`
3. الـ trigger يمر على جميع المزارع التي لها حجوزات موثقة من هذا المستثمر
4. لكل مزرعة، يتم إعادة حساب المبالغ المالية مع استثناء المستثمرين المحذوفين
5. يتم تحديث البطاقات المالية تلقائياً

## الآن يمكنك

- حذف أي مستثمر بدون أخطاء ✅
- النظام يعيد حساب المبالغ المالية تلقائياً ✅
- البطاقات المالية تتحدث فوراً لتعكس التغيير ✅

## الملفات المضافة

- `supabase/migrations/20251216030500_fix_investor_delete_trigger.sql`

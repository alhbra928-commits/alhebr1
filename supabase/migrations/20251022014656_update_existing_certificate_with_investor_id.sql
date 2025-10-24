/*
  # تحديث الشهادة الموجودة بـ investor_id الصحيح
  
  ## المشكلة
  - الشهادة الحالية تم إنشاؤها بـ investor_id = NULL
  - لا تظهر في لوحة المستثمر ولا في إدارة التوثيق
  
  ## الحل
  - تحديث الشهادة الموجودة بـ investor_id الصحيح
  - استخدام SECURITY DEFINER لتجاوز RLS
  
  ## الأمان
  - دالة واحدة محددة للتحديث
  - تحديث investor_id فقط للشهادات التي investor_id = NULL
*/

-- إنشاء دالة لتحديث الشهادات بدون investor_id
CREATE OR REPLACE FUNCTION fix_documentation_investor_ids()
RETURNS TABLE(
  documentation_id uuid,
  certificate_code text,
  investor_id uuid,
  investor_name text,
  phone text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE documentation d
  SET investor_id = inv.id,
      updated_at = now()
  FROM (
    SELECT 
      r.id as booking_id,
      i.id,
      i.phone
    FROM reservations r
    INNER JOIN investors i ON i.phone = r.customer_phone
    WHERE r.deleted_at IS NULL
      AND i.deleted_at IS NULL
  ) inv
  WHERE d.booking_id = inv.booking_id
    AND d.investor_id IS NULL
  RETURNING 
    d.id as documentation_id,
    d.certificate_code,
    d.investor_id,
    d.investor_name,
    inv.phone;
END;
$$;

-- تنفيذ الدالة لتحديث الشهادات
SELECT * FROM fix_documentation_investor_ids();

-- منح صلاحيات التنفيذ
GRANT EXECUTE ON FUNCTION fix_documentation_investor_ids() TO authenticated;

COMMENT ON FUNCTION fix_documentation_investor_ids IS 
'تحديث investor_id للشهادات التي تم إنشاؤها بـ investor_id = NULL';

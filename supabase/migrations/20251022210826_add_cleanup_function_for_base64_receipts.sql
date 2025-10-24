/*
  # إضافة دالة تنظيف للإيصالات base64
  
  1. الوظيفة
    - دالة للمشرف لحذف الإيصالات القديمة base64
    - تساعد في تقليل حجم DB والتحسين
  
  2. الاستخدام
    - يمكن للمشرف استدعائها يدوياً
    - أو جدولتها دورياً
*/

-- دالة لحذف الإيصالات base64 القديمة (soft delete)
CREATE OR REPLACE FUNCTION cleanup_old_base64_receipts(days_old INTEGER DEFAULT 30)
RETURNS TABLE(deleted_count INTEGER) AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  -- حذف soft للإيصالات base64 الأقدم من X يوم
  UPDATE payment_receipts
  SET 
    deleted_at = NOW(),
    updated_at = NOW()
  WHERE 
    storage_type = 'base64'
    AND deleted_at IS NULL
    AND created_at < NOW() - (days_old || ' days')::INTERVAL
    AND status IN ('rejected'); -- فقط المرفوضة
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  RETURN QUERY SELECT affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- منح الصلاحية للمشرفين فقط
REVOKE ALL ON FUNCTION cleanup_old_base64_receipts FROM PUBLIC;

COMMENT ON FUNCTION cleanup_old_base64_receipts IS 'دالة لحذف الإيصالات base64 المرفوضة القديمة لتوفير المساحة';
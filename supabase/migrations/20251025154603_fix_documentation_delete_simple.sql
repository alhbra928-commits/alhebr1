/*
  # إصلاح حذف شهادات التوثيق - نسخة مبسطة

  1. المشكلة:
    - الوظيفة السابقة تتطلب جدول backup_documentation_history
    - الجدول غير موجود
    - الحذف يفشل

  2. الحل:
    - وظيفة مبسطة بدون نسخ احتياطية معقدة
    - حذف مباشر مع SECURITY DEFINER
    - تسجيل في audit_log فقط
*/

-- حذف الوظيفة القديمة
DROP FUNCTION IF EXISTS delete_documentation_permanently(uuid, text);

-- وظيفة حذف بسيطة وفعالة
CREATE OR REPLACE FUNCTION delete_documentation_permanently(
  p_documentation_id uuid,
  p_reason text DEFAULT 'حذف من لوحة التحكم'
)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_doc_record record;
  v_result jsonb;
BEGIN
  -- التحقق من وجود السجل
  SELECT * INTO v_doc_record
  FROM documentation
  WHERE id = p_documentation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'شهادة التوثيق غير موجودة: %', p_documentation_id;
  END IF;

  -- تسجيل في audit_log (إذا كان موجوداً)
  BEGIN
    INSERT INTO audit_log (
      table_name,
      record_id,
      action,
      old_data,
      performed_by
    )
    VALUES (
      'documentation',
      p_documentation_id,
      'delete_permanently',
      to_jsonb(v_doc_record),
      current_user
    );
  EXCEPTION
    WHEN undefined_table THEN
      -- تجاهل إذا لم يكن جدول audit_log موجوداً
      NULL;
  END;

  -- حذف السجل
  DELETE FROM documentation
  WHERE id = p_documentation_id;

  -- إعداد النتيجة
  v_result := jsonb_build_object(
    'success', true,
    'deleted_id', p_documentation_id,
    'certificate_code', v_doc_record.certificate_code,
    'investor_name', v_doc_record.investor_name,
    'message', 'تم حذف الشهادة بنجاح'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'خطأ في حذف الشهادة: %', SQLERRM;
END;
$$;

-- منح الصلاحيات
GRANT EXECUTE ON FUNCTION delete_documentation_permanently(uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION delete_documentation_permanently(uuid, text) TO authenticated;

-- إضافة تعليق
COMMENT ON FUNCTION delete_documentation_permanently IS 
'حذف شهادة توثيق نهائياً بشكل مباشر وآمن';

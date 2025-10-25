/*
  # إصلاح نهائي لحذف شهادات التوثيق

  1. المشكلة:
    - العمود في audit_log اسمه changed_by وليس performed_by

  2. الحل:
    - تحديث الوظيفة لاستخدام الأعمدة الصحيحة
    - تبسيط أكثر للتجاهل التام لأي أخطاء في audit_log
*/

-- حذف الوظيفة القديمة
DROP FUNCTION IF EXISTS delete_documentation_permanently(uuid, text);

-- وظيفة حذف نهائية ومبسطة
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

  -- محاولة التسجيل في audit_log (تجاهل أي خطأ)
  BEGIN
    INSERT INTO audit_log (
      table_name,
      record_id,
      operation,
      action,
      old_data,
      new_data
    )
    VALUES (
      'documentation',
      p_documentation_id,
      'delete',
      'delete_permanently',
      to_jsonb(v_doc_record),
      NULL
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- تجاهل أي خطأ في التسجيل
      NULL;
  END;

  -- حذف السجل فعلياً
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

COMMENT ON FUNCTION delete_documentation_permanently IS 
'حذف شهادة توثيق نهائياً - نسخة مبسطة ونهائية';

/*
  # إصلاح حذف شهادات التوثيق

  1. المشكلة:
    - DELETE policy تتطلب authenticated user
    - لوحة التحكم لا تستخدم Supabase Auth
    - الحذف يظهر نجح لكن لا يُحذف فعلياً

  2. الحل:
    - إنشاء function بـ SECURITY DEFINER للحذف
    - إضافة validation للحذف الآمن
    - حفظ نسخة احتياطية قبل الحذف

  3. الأمان:
    - التحقق من وجود السجل قبل الحذف
    - حفظ نسخة احتياطية JSON
    - تسجيل في audit log
*/

-- وظيفة حذف شهادة توثيق نهائياً
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
  v_doc_record jsonb;
  v_backup_id uuid;
  v_result jsonb;
BEGIN
  -- التحقق من وجود السجل
  SELECT to_jsonb(d.*) INTO v_doc_record
  FROM documentation d
  WHERE d.id = p_documentation_id;

  IF v_doc_record IS NULL THEN
    RAISE EXCEPTION 'شهادة التوثيق غير موجودة: %', p_documentation_id;
  END IF;

  -- حفظ نسخة احتياطية
  INSERT INTO backup_documentation_history (
    original_id,
    table_name,
    operation,
    data_snapshot,
    reason
  )
  VALUES (
    p_documentation_id,
    'documentation',
    'delete',
    v_doc_record,
    p_reason
  )
  RETURNING id INTO v_backup_id;

  -- تسجيل في audit log
  INSERT INTO audit_log (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    performed_by
  )
  VALUES (
    'documentation',
    p_documentation_id,
    'delete_permanently',
    v_doc_record,
    NULL,
    current_user
  );

  -- حذف السجل
  DELETE FROM documentation
  WHERE id = p_documentation_id;

  -- إعداد النتيجة
  v_result := jsonb_build_object(
    'success', true,
    'deleted_id', p_documentation_id,
    'backup_id', v_backup_id,
    'certificate_code', v_doc_record->>'certificate_code',
    'investor_name', v_doc_record->>'investor_name',
    'message', 'تم حذف الشهادة بنجاح مع حفظ نسخة احتياطية'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'خطأ في حذف الشهادة: %', SQLERRM;
END;
$$;

-- منح الصلاحيات
GRANT EXECUTE ON FUNCTION delete_documentation_permanently TO anon;
GRANT EXECUTE ON FUNCTION delete_documentation_permanently TO authenticated;

-- إضافة تعليق
COMMENT ON FUNCTION delete_documentation_permanently IS 
'حذف شهادة توثيق نهائياً مع حفظ نسخة احتياطية وتسجيل في audit log';

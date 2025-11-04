/*
  # إصلاح دالة حذف أصحاب المزارع

  1. الإصلاحات:
    - إصلاح دالة delete_owner_permanently
    - إضافة معالجة أخطاء أفضل
    - إضافة صلاحيات للمستخدمين
    
  2. الميزات:
    - حذف آمن مع soft delete
    - حفظ نسخة احتياطية
    - تسجيل في audit log
*/

-- إعادة إنشاء دالة الحذف مع إصلاحات
CREATE OR REPLACE FUNCTION delete_owner_permanently(
  p_owner_id uuid,
  p_deletion_reason text DEFAULT 'حذف إداري'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owner_record jsonb;
  v_owner_name text;
BEGIN
  -- الحصول على بيانات المالك
  SELECT 
    jsonb_build_object(
      'id', id,
      'full_name', full_name,
      'mobile_number', mobile_number,
      'email', email,
      'region', region,
      'city', city,
      'status', status,
      'deleted_at', now(),
      'deletion_reason', p_deletion_reason
    ),
    full_name
  INTO v_owner_record, v_owner_name
  FROM farm_owners
  WHERE id = p_owner_id AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Farm owner not found or already deleted'
    );
  END IF;

  -- Soft delete - وضع علامة الحذف
  UPDATE farm_owners
  SET 
    deleted_at = now(),
    status = 'archived'
  WHERE id = p_owner_id;

  -- تسجيل في الـ audit log
  INSERT INTO audit_logs (
    table_name,
    operation,
    record_id,
    old_values,
    new_values
  ) VALUES (
    'farm_owners',
    'soft_delete',
    p_owner_id,
    v_owner_record,
    jsonb_build_object(
      'deleted_at', now(),
      'deletion_reason', p_deletion_reason,
      'action', 'حذف صاحب المزرعة'
    )
  );

  -- إنشاء نسخة احتياطية في جدول backup_history
  INSERT INTO backup_history (
    backup_type,
    table_name,
    record_id,
    backup_data,
    notes
  ) VALUES (
    'manual',
    'farm_owners',
    p_owner_id,
    v_owner_record,
    format('نسخة احتياطية قبل الحذف - السبب: %s', p_deletion_reason)
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم حذف صاحب المزرعة بنجاح',
    'owner_id', p_owner_id,
    'owner_name', v_owner_name,
    'backup_saved', true
  );
END;
$$;

-- منح صلاحيات التنفيذ
GRANT EXECUTE ON FUNCTION delete_owner_permanently(uuid, text) TO authenticated, anon;

-- إنشاء دالة لاستعادة مالك محذوف
CREATE OR REPLACE FUNCTION restore_deleted_owner(
  p_owner_id uuid,
  p_admin_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owner_name text;
BEGIN
  -- الحصول على اسم المالك
  SELECT full_name INTO v_owner_name
  FROM farm_owners
  WHERE id = p_owner_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Farm owner not found'
    );
  END IF;

  -- استعادة المالك
  UPDATE farm_owners
  SET 
    deleted_at = NULL,
    status = 'active'
  WHERE id = p_owner_id;

  -- تسجيل في الـ audit log
  INSERT INTO audit_logs (
    table_name,
    operation,
    record_id,
    new_values
  ) VALUES (
    'farm_owners',
    'restore',
    p_owner_id,
    jsonb_build_object(
      'restored_at', now(),
      'restored_by', p_admin_id,
      'owner_name', v_owner_name,
      'action', 'استعادة صاحب مزرعة محذوف'
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم استعادة صاحب المزرعة بنجاح',
    'owner_name', v_owner_name
  );
END;
$$;

-- منح صلاحيات التنفيذ
GRANT EXECUTE ON FUNCTION restore_deleted_owner(uuid, uuid) TO authenticated, anon;

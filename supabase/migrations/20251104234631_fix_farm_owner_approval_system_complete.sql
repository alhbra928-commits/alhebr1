/*
  # إصلاح نظام اعتماد أصحاب المزارع - إصلاح شامل

  1. الإصلاحات:
    - إصلاح صلاحيات الدوال
    - إضافة صلاحيات anon للقراءة
    - إصلاح الدوال لتعمل مع admin_sessions
    - ربط النظام مع لوحة صاحب المزرعة
    
  2. الميزات:
    - الموافقة والرفض من لوحة الإدارة
    - إرسال إشعارات لصاحب المزرعة
    - تحديث الحالة تلقائياً
*/

-- منح صلاحيات القراءة لـ anon على farm_owners
DROP POLICY IF EXISTS "anon_read_farm_owners" ON farm_owners;
CREATE POLICY "anon_read_farm_owners"
  ON farm_owners
  FOR SELECT
  TO anon
  USING (deleted_at IS NULL);

-- إعادة إنشاء دالة الموافقة مع إصلاحات
CREATE OR REPLACE FUNCTION approve_farm_owner(
  p_owner_id uuid,
  p_admin_id uuid,
  p_notes text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owner_name text;
  v_owner_mobile text;
  v_result jsonb;
BEGIN
  -- الحصول على معلومات الصاحب
  SELECT full_name, mobile_number 
  INTO v_owner_name, v_owner_mobile
  FROM farm_owners
  WHERE id = p_owner_id AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Farm owner not found'
    );
  END IF;

  -- تحديث حالة الموافقة
  UPDATE farm_owners
  SET 
    approval_status = 'approved',
    status = 'active',
    approved_at = now(),
    approved_by = p_admin_id,
    notes = COALESCE(p_notes, notes),
    updated_at = now()
  WHERE id = p_owner_id AND deleted_at IS NULL;

  -- تسجيل في الـ audit log
  INSERT INTO audit_logs (
    table_name, 
    operation, 
    record_id, 
    new_values
  ) VALUES (
    'farm_owners',
    'approve',
    p_owner_id,
    jsonb_build_object(
      'approval_status', 'approved',
      'approved_by', p_admin_id,
      'owner_name', v_owner_name,
      'action', 'تم اعتماد بطاقة صاحب المزرعة'
    )
  );

  -- إنشاء إشعار لصاحب المزرعة
  INSERT INTO notifications (
    user_id,
    type,
    title_ar,
    message_ar,
    status
  ) VALUES (
    p_owner_id,
    'account_approved',
    'تم اعتماد حسابك',
    'مبروك! تم اعتماد بطاقتك كصاحب مزرعة. يمكنك الآن الدخول إلى لوحة التحكم الخاصة بك.',
    'unread'
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم اعتماد بطاقة صاحب المزرعة بنجاح',
    'owner_id', p_owner_id,
    'owner_name', v_owner_name
  );
END;
$$;

-- إعادة إنشاء دالة الرفض مع إصلاحات
CREATE OR REPLACE FUNCTION reject_farm_owner(
  p_owner_id uuid,
  p_admin_id uuid,
  p_reason text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owner_name text;
  v_owner_mobile text;
BEGIN
  -- التحقق من وجود سبب الرفض
  IF p_reason IS NULL OR trim(p_reason) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'يجب إدخال سبب الرفض'
    );
  END IF;

  -- الحصول على معلومات الصاحب
  SELECT full_name, mobile_number 
  INTO v_owner_name, v_owner_mobile
  FROM farm_owners
  WHERE id = p_owner_id AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Farm owner not found'
    );
  END IF;

  -- تحديث حالة الرفض
  UPDATE farm_owners
  SET 
    approval_status = 'rejected',
    status = 'suspended',
    rejection_reason = p_reason,
    approved_at = NULL,
    approved_by = NULL,
    updated_at = now()
  WHERE id = p_owner_id AND deleted_at IS NULL;

  -- تسجيل في الـ audit log
  INSERT INTO audit_logs (
    table_name, 
    operation, 
    record_id, 
    new_values
  ) VALUES (
    'farm_owners',
    'reject',
    p_owner_id,
    jsonb_build_object(
      'approval_status', 'rejected',
      'rejection_reason', p_reason,
      'rejected_by', p_admin_id,
      'owner_name', v_owner_name,
      'action', 'تم رفض بطاقة صاحب المزرعة'
    )
  );

  -- إنشاء إشعار لصاحب المزرعة
  INSERT INTO notifications (
    user_id,
    type,
    title_ar,
    message_ar,
    status
  ) VALUES (
    p_owner_id,
    'account_rejected',
    'تم رفض طلبك',
    format('للأسف، تم رفض طلب التسجيل كصاحب مزرعة. السبب: %s', p_reason),
    'unread'
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم رفض بطاقة صاحب المزرعة',
    'owner_id', p_owner_id,
    'owner_name', v_owner_name
  );
END;
$$;

-- إعادة إنشاء دالة إعادة الطلب
CREATE OR REPLACE FUNCTION reset_farm_owner_approval(
  p_owner_id uuid,
  p_admin_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owner_name text;
BEGIN
  SELECT full_name INTO v_owner_name
  FROM farm_owners
  WHERE id = p_owner_id AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Farm owner not found'
    );
  END IF;

  UPDATE farm_owners
  SET 
    approval_status = 'pending',
    status = 'pending',
    approved_at = NULL,
    approved_by = NULL,
    rejection_reason = NULL,
    updated_at = now()
  WHERE id = p_owner_id AND deleted_at IS NULL;

  -- تسجيل في الـ audit log
  INSERT INTO audit_logs (
    table_name, 
    operation, 
    record_id, 
    new_values
  ) VALUES (
    'farm_owners',
    'reset_approval',
    p_owner_id,
    jsonb_build_object(
      'approval_status', 'pending',
      'owner_name', v_owner_name,
      'action', 'إعادة الطلب للمراجعة'
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم إعادة الطلب للمراجعة',
    'owner_name', v_owner_name
  );
END;
$$;

-- منح صلاحيات تنفيذ الدوال
GRANT EXECUTE ON FUNCTION approve_farm_owner(uuid, uuid, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION reject_farm_owner(uuid, uuid, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION reset_farm_owner_approval(uuid, uuid) TO authenticated, anon;

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_farm_owners_approval_pending 
  ON farm_owners(approval_status, created_at DESC) 
  WHERE approval_status = 'pending' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_farm_owners_mobile_lookup
  ON farm_owners(mobile_number)
  WHERE deleted_at IS NULL;

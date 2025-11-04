/*
  # نظام الموافقة على بطاقات أصحاب المزارع

  1. التغييرات:
    - إضافة approval_status (pending/approved/rejected)
    - إضافة approved_at
    - إضافة approved_by
    - إضافة rejection_reason
    - إضافة notes للملاحظات الإدارية

  2. الحالات:
    - pending: في انتظار المراجعة (افتراضي)
    - approved: تم الاعتماد
    - rejected: تم الرفض
*/

-- إضافة حقول الموافقة
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN approval_status text DEFAULT 'pending' 
      CHECK (approval_status IN ('pending', 'approved', 'rejected'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN approved_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN approved_by uuid REFERENCES admin_users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN rejection_reason text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'notes'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN notes text;
  END IF;
END $$;

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_farm_owners_approval_status 
  ON farm_owners(approval_status) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_farm_owners_approved_at 
  ON farm_owners(approved_at) 
  WHERE deleted_at IS NULL;

-- تحديث السجلات الموجودة
UPDATE farm_owners 
SET approval_status = 'approved', 
    approved_at = created_at
WHERE approval_status IS NULL 
  AND status = 'active'
  AND deleted_at IS NULL;

-- إنشاء دالة للموافقة
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
BEGIN
  -- الحصول على معلومات الصاحب
  SELECT full_name, mobile_number 
  INTO v_owner_name, v_owner_mobile
  FROM farm_owners
  WHERE id = p_owner_id AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Farm owner not found';
  END IF;

  -- تحديث حالة الموافقة
  UPDATE farm_owners
  SET 
    approval_status = 'approved',
    approved_at = now(),
    approved_by = p_admin_id,
    notes = COALESCE(p_notes, notes),
    updated_at = now(),
    updated_by = p_admin_id
  WHERE id = p_owner_id;

  -- تسجيل في الـ audit log
  INSERT INTO audit_logs (
    table_name, 
    operation, 
    record_id, 
    new_values, 
    user_id
  ) VALUES (
    'farm_owners',
    'approve',
    p_owner_id,
    jsonb_build_object(
      'approval_status', 'approved',
      'approved_by', p_admin_id,
      'owner_name', v_owner_name
    ),
    p_admin_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم اعتماد بطاقة صاحب المزرعة',
    'owner_id', p_owner_id,
    'owner_name', v_owner_name
  );
END;
$$;

-- إنشاء دالة للرفض
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
    RAISE EXCEPTION 'Rejection reason is required';
  END IF;

  -- الحصول على معلومات الصاحب
  SELECT full_name, mobile_number 
  INTO v_owner_name, v_owner_mobile
  FROM farm_owners
  WHERE id = p_owner_id AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Farm owner not found';
  END IF;

  -- تحديث حالة الرفض
  UPDATE farm_owners
  SET 
    approval_status = 'rejected',
    rejection_reason = p_reason,
    approved_at = NULL,
    approved_by = NULL,
    updated_at = now(),
    updated_by = p_admin_id
  WHERE id = p_owner_id;

  -- تسجيل في الـ audit log
  INSERT INTO audit_logs (
    table_name, 
    operation, 
    record_id, 
    new_values, 
    user_id
  ) VALUES (
    'farm_owners',
    'reject',
    p_owner_id,
    jsonb_build_object(
      'approval_status', 'rejected',
      'rejection_reason', p_reason,
      'rejected_by', p_admin_id,
      'owner_name', v_owner_name
    ),
    p_admin_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم رفض بطاقة صاحب المزرعة',
    'owner_id', p_owner_id,
    'owner_name', v_owner_name
  );
END;
$$;

-- إنشاء دالة لإعادة الطلب
CREATE OR REPLACE FUNCTION reset_farm_owner_approval(
  p_owner_id uuid,
  p_admin_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE farm_owners
  SET 
    approval_status = 'pending',
    approved_at = NULL,
    approved_by = NULL,
    rejection_reason = NULL,
    updated_at = now(),
    updated_by = p_admin_id
  WHERE id = p_owner_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم إعادة الطلب للمراجعة'
  );
END;
$$;

-- تعليق على الأعمدة الجديدة
COMMENT ON COLUMN farm_owners.approval_status IS 'حالة الموافقة: pending, approved, rejected';
COMMENT ON COLUMN farm_owners.approved_at IS 'تاريخ الموافقة';
COMMENT ON COLUMN farm_owners.approved_by IS 'المسؤول الذي وافق';
COMMENT ON COLUMN farm_owners.rejection_reason IS 'سبب الرفض';
COMMENT ON COLUMN farm_owners.notes IS 'ملاحظات إدارية';

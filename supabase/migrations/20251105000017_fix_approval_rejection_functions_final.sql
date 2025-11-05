/*
  # إصلاح دوال الموافقة والرفض - الإصدار النهائي

  1. المشاكل:
    - rejected_by غير موجود في الجدول
    - status constraint لا يسمح بـ "rejected"
    - approved_by يجب أن يكون nullable
    
  2. الحل:
    - استخدام الأعمدة الموجودة فقط
    - تغيير approval_status وليس status
    - جعل approved_by nullable
*/

-- حذف الدوال القديمة
DROP FUNCTION IF EXISTS approve_farm_owner(uuid, uuid, text);
DROP FUNCTION IF EXISTS reject_farm_owner(uuid, uuid, text);

-- دالة الموافقة المحسّنة
CREATE OR REPLACE FUNCTION approve_farm_owner(
  p_owner_id uuid,
  p_admin_id uuid DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_owner_data jsonb;
  v_result jsonb;
BEGIN
  -- التحقق من وجود المالك
  IF NOT EXISTS (
    SELECT 1 FROM farm_owners 
    WHERE id = p_owner_id AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Owner not found or has been deleted';
  END IF;

  -- تحديث حالة الموافقة
  UPDATE farm_owners
  SET 
    approval_status = 'approved',
    approved_by = p_admin_id,
    approved_at = now(),
    rejection_reason = NULL,
    status = 'active',
    updated_at = now()
  WHERE id = p_owner_id
  RETURNING 
    jsonb_build_object(
      'id', id,
      'full_name', full_name,
      'approval_status', approval_status,
      'status', status,
      'approved_at', approved_at
    ) INTO v_owner_data;

  -- تسجيل في audit log
  INSERT INTO audit_log (
    table_name,
    record_id,
    action,
    new_data,
    performed_by,
    notes
  ) VALUES (
    'farm_owners',
    p_owner_id,
    'approve',
    v_owner_data,
    p_admin_id,
    COALESCE(p_notes, 'تمت الموافقة على صاحب المزرعة')
  );

  -- إرسال إشعار للمالك
  INSERT INTO notifications (
    user_id,
    title_ar,
    title_en,
    message_ar,
    message_en,
    type,
    status
  ) VALUES (
    p_owner_id,
    'تمت الموافقة على حسابك',
    'Your account has been approved',
    'مرحباً بك! تم اعتماد حسابك كصاحب مزرعة. يمكنك الآن إدارة مزرعتك بالكامل.',
    'Welcome! Your account has been approved as a farm owner. You can now manage your farm fully.',
    'account_approved',
    'unread'
  );

  v_result := jsonb_build_object(
    'success', true,
    'message', 'تمت الموافقة بنجاح',
    'data', v_owner_data
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error approving owner: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة الرفض المحسّنة
CREATE OR REPLACE FUNCTION reject_farm_owner(
  p_owner_id uuid,
  p_admin_id uuid DEFAULT NULL,
  p_reason text DEFAULT 'تم رفض الطلب'
)
RETURNS jsonb AS $$
DECLARE
  v_owner_data jsonb;
  v_result jsonb;
BEGIN
  -- التحقق من وجود المالك
  IF NOT EXISTS (
    SELECT 1 FROM farm_owners 
    WHERE id = p_owner_id AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Owner not found or has been deleted';
  END IF;

  -- تحديث حالة الرفض
  UPDATE farm_owners
  SET 
    approval_status = 'rejected',
    rejection_reason = p_reason,
    approved_by = NULL,
    approved_at = NULL,
    -- نبقي status كما هو أو نجعله frozen (بدون rejected)
    status = CASE 
      WHEN status = 'active' THEN 'frozen'
      ELSE status
    END,
    updated_at = now()
  WHERE id = p_owner_id
  RETURNING 
    jsonb_build_object(
      'id', id,
      'full_name', full_name,
      'approval_status', approval_status,
      'status', status,
      'rejection_reason', rejection_reason
    ) INTO v_owner_data;

  -- تسجيل في audit log
  INSERT INTO audit_log (
    table_name,
    record_id,
    action,
    new_data,
    performed_by,
    notes
  ) VALUES (
    'farm_owners',
    p_owner_id,
    'reject',
    v_owner_data,
    p_admin_id,
    COALESCE(p_reason, 'تم رفض صاحب المزرعة')
  );

  -- إرسال إشعار للمالك
  INSERT INTO notifications (
    user_id,
    title_ar,
    title_en,
    message_ar,
    message_en,
    type,
    status
  ) VALUES (
    p_owner_id,
    'تم رفض طلبك',
    'Your request has been rejected',
    format('عذراً، تم رفض طلب التسجيل. السبب: %s', p_reason),
    format('Sorry, your registration request has been rejected. Reason: %s', p_reason),
    'account_rejected',
    'unread'
  );

  v_result := jsonb_build_object(
    'success', true,
    'message', 'تم رفض الطلب بنجاح',
    'data', v_owner_data
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error rejecting owner: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- التأكد من أن approved_by يمكن أن يكون NULL
DO $$
BEGIN
  ALTER TABLE farm_owners ALTER COLUMN approved_by DROP NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    -- العمود بالفعل nullable
    NULL;
END $$;

-- إضافة تعليقات
COMMENT ON FUNCTION approve_farm_owner IS 'اعتماد صاحب مزرعة - admin_id اختياري';
COMMENT ON FUNCTION reject_farm_owner IS 'رفض صاحب مزرعة - admin_id اختياري';

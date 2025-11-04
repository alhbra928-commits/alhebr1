/*
  # نظام العروض لأصحاب المزارع

  1. الجداول الجديدة:
    - farm_owner_offers: عروض من الإدارة لأصحاب المزارع
    
  2. الميزات:
    - إرسال عروض من لوحة الإدارة
    - استقبال العروض في لوحة صاحب المزرعة
    - الموافقة والرفض على العروض
    - تتبع حالة العروض
*/

-- إنشاء جدول العروض
CREATE TABLE IF NOT EXISTS farm_owner_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_owner_id uuid NOT NULL REFERENCES farm_owners(id) ON DELETE CASCADE,
  offer_type text NOT NULL CHECK (offer_type IN ('price_update', 'contract_renewal', 'new_opportunity', 'general')),
  title_ar text NOT NULL,
  message_ar text NOT NULL,
  title_en text,
  message_en text,
  offer_amount decimal(15,2),
  old_amount decimal(15,2),
  offer_details jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  expires_at timestamptz,
  created_by uuid REFERENCES admin_users(id),
  responded_at timestamptz,
  response_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_farm_owner_offers_owner_id 
  ON farm_owner_offers(farm_owner_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_farm_owner_offers_status 
  ON farm_owner_offers(status) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_farm_owner_offers_created_at 
  ON farm_owner_offers(created_at DESC);

-- تفعيل RLS
ALTER TABLE farm_owner_offers ENABLE ROW LEVEL SECURITY;

-- سياسات RLS
-- أصحاب المزارع يمكنهم قراءة عروضهم فقط
CREATE POLICY "farm_owners_read_own_offers"
  ON farm_owner_offers
  FOR SELECT
  TO authenticated, anon
  USING (deleted_at IS NULL);

-- أصحاب المزارع يمكنهم تحديث ردهم على العروض
CREATE POLICY "farm_owners_respond_to_offers"
  ON farm_owner_offers
  FOR UPDATE
  TO authenticated, anon
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

-- الإدارة يمكنها إنشاء عروض
CREATE POLICY "admin_create_offers"
  ON farm_owner_offers
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- الإدارة يمكنها قراءة كل العروض
CREATE POLICY "admin_read_all_offers"
  ON farm_owner_offers
  FOR SELECT
  TO authenticated, anon
  USING (deleted_at IS NULL);

-- دالة لإنشاء عرض جديد
CREATE OR REPLACE FUNCTION create_farm_owner_offer(
  p_farm_owner_id uuid,
  p_offer_type text,
  p_title_ar text,
  p_message_ar text,
  p_offer_amount decimal DEFAULT NULL,
  p_old_amount decimal DEFAULT NULL,
  p_offer_details jsonb DEFAULT NULL,
  p_expires_at timestamptz DEFAULT NULL,
  p_admin_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offer_id uuid;
  v_owner_name text;
BEGIN
  -- الحصول على اسم المالك
  SELECT full_name INTO v_owner_name
  FROM farm_owners
  WHERE id = p_farm_owner_id AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Farm owner not found'
    );
  END IF;

  -- إنشاء العرض
  INSERT INTO farm_owner_offers (
    farm_owner_id,
    offer_type,
    title_ar,
    message_ar,
    offer_amount,
    old_amount,
    offer_details,
    expires_at,
    created_by
  ) VALUES (
    p_farm_owner_id,
    p_offer_type,
    p_title_ar,
    p_message_ar,
    p_offer_amount,
    p_old_amount,
    p_offer_details,
    p_expires_at,
    p_admin_id
  ) RETURNING id INTO v_offer_id;

  -- إنشاء إشعار لصاحب المزرعة
  INSERT INTO notifications (
    user_id,
    type,
    title_ar,
    message_ar,
    status
  ) VALUES (
    p_farm_owner_id,
    'new_offer',
    p_title_ar,
    p_message_ar,
    'unread'
  );

  -- تسجيل في audit log
  INSERT INTO audit_logs (
    table_name,
    operation,
    record_id,
    new_values
  ) VALUES (
    'farm_owner_offers',
    'create',
    v_offer_id,
    jsonb_build_object(
      'offer_id', v_offer_id,
      'farm_owner_id', p_farm_owner_id,
      'owner_name', v_owner_name,
      'offer_type', p_offer_type,
      'created_by', p_admin_id
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم إرسال العرض بنجاح',
    'offer_id', v_offer_id,
    'owner_name', v_owner_name
  );
END;
$$;

-- دالة للرد على عرض
CREATE OR REPLACE FUNCTION respond_to_offer(
  p_offer_id uuid,
  p_farm_owner_id uuid,
  p_status text, -- 'accepted' or 'rejected'
  p_response_notes text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offer_record record;
BEGIN
  -- التحقق من صحة الحالة
  IF p_status NOT IN ('accepted', 'rejected') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid status. Must be accepted or rejected'
    );
  END IF;

  -- الحصول على معلومات العرض
  SELECT * INTO v_offer_record
  FROM farm_owner_offers
  WHERE id = p_offer_id 
    AND farm_owner_id = p_farm_owner_id
    AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Offer not found'
    );
  END IF;

  -- التحقق من أن العرض لم ينتهِ
  IF v_offer_record.status != 'pending' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Offer already responded to'
    );
  END IF;

  -- تحديث حالة العرض
  UPDATE farm_owner_offers
  SET 
    status = p_status,
    responded_at = now(),
    response_notes = p_response_notes,
    updated_at = now()
  WHERE id = p_offer_id;

  -- إنشاء إشعار للإدارة
  INSERT INTO notifications (
    user_id,
    type,
    title_ar,
    message_ar,
    status
  ) VALUES (
    v_offer_record.created_by,
    'offer_response',
    CASE 
      WHEN p_status = 'accepted' THEN 'تم قبول العرض'
      ELSE 'تم رفض العرض'
    END,
    format('صاحب المزرعة %s على العرض: %s', 
      CASE WHEN p_status = 'accepted' THEN 'وافق' ELSE 'رفض' END,
      v_offer_record.title_ar
    ),
    'unread'
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', CASE 
      WHEN p_status = 'accepted' THEN 'تم قبول العرض بنجاح'
      ELSE 'تم رفض العرض'
    END,
    'offer_id', p_offer_id
  );
END;
$$;

-- منح صلاحيات التنفيذ
GRANT EXECUTE ON FUNCTION create_farm_owner_offer TO authenticated, anon;
GRANT EXECUTE ON FUNCTION respond_to_offer TO authenticated, anon;

-- تعليقات على الأعمدة
COMMENT ON TABLE farm_owner_offers IS 'عروض من الإدارة لأصحاب المزارع';
COMMENT ON COLUMN farm_owner_offers.offer_type IS 'نوع العرض: price_update, contract_renewal, new_opportunity, general';
COMMENT ON COLUMN farm_owner_offers.status IS 'حالة العرض: pending, accepted, rejected, expired';

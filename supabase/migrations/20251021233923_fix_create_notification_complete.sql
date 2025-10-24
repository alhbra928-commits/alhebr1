/*
  # إصلاح دالة create_notification بالكامل
  
  إضافة جميع الحقول المطلوبة: user_id, title_en, message_en
*/

-- تحديث القيد
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_booking_status_check;
ALTER TABLE reservations ADD CONSTRAINT reservations_booking_status_check 
  CHECK (booking_status IN ('processing', 'approved', 'pending_verification', 'verified', 'confirmed', 'certificate_issued'));

-- تحديث الدالة
CREATE OR REPLACE FUNCTION create_notification(
  p_investor_id uuid,
  p_reservation_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_priority text DEFAULT 'normal',
  p_action_url text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_notification_id uuid;
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM notifications
  WHERE investor_id = p_investor_id
    AND reservation_id = p_reservation_id
    AND type = p_type
    AND created_at > now() - interval '1 minute';
  
  IF v_count > 0 THEN
    RETURN NULL;
  END IF;
  
  INSERT INTO notifications (
    user_id,
    investor_id,
    reservation_id,
    type,
    title_ar,
    title_en,
    message_ar,
    message_en,
    status,
    is_read,
    priority,
    action_url,
    related_id,
    related_type
  )
  VALUES (
    p_investor_id,
    p_investor_id,
    p_reservation_id,
    p_type,
    p_title,
    p_title,
    p_message,
    p_message,
    'unread',
    false,
    p_priority,
    p_action_url,
    p_reservation_id,
    'reservation'
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

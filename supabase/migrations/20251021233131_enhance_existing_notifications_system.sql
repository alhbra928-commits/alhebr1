/*
  # تحسين نظام الإشعارات الموجود
  
  1. إضافة الأعمدة المفقودة
  2. إنشاء الدوال والـ Triggers
  3. تفعيل Realtime
*/

-- إضافة الأعمدة المفقودة إن لم تكن موجودة
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'investor_id') THEN
    ALTER TABLE notifications ADD COLUMN investor_id uuid;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'reservation_id') THEN
    ALTER TABLE notifications ADD COLUMN reservation_id uuid;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'status') THEN
    ALTER TABLE notifications ADD COLUMN status text DEFAULT 'unread';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'priority') THEN
    ALTER TABLE notifications ADD COLUMN priority text DEFAULT 'normal';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'action_url') THEN
    ALTER TABLE notifications ADD COLUMN action_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read_at') THEN
    ALTER TABLE notifications ADD COLUMN read_at timestamptz;
  END IF;
END $$;

-- إنشاء جدول booking_state_changes
CREATE TABLE IF NOT EXISTS booking_state_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL,
  from_status text,
  to_status text NOT NULL,
  changed_by_type text CHECK (changed_by_type IN ('system', 'admin', 'investor')),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_state_changes_reservation ON booking_state_changes(reservation_id);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_state_changes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_notifications" ON notifications;
CREATE POLICY "public_read_notifications" ON notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_update_notifications" ON notifications;
CREATE POLICY "public_update_notifications" ON notifications FOR UPDATE USING (true);

DROP POLICY IF EXISTS "public_insert_notifications" ON notifications;
CREATE POLICY "public_insert_notifications" ON notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_state_changes" ON booking_state_changes;
CREATE POLICY "public_read_state_changes" ON booking_state_changes FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_insert_state_changes" ON booking_state_changes;
CREATE POLICY "public_insert_state_changes" ON booking_state_changes FOR INSERT WITH CHECK (true);

-- الدوال
CREATE OR REPLACE FUNCTION get_unread_notifications_count(p_investor_phone text)
RETURNS integer AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*)::integer INTO v_count
  FROM notifications n
  JOIN investors i ON i.id = n.investor_id
  WHERE i.phone = p_investor_phone 
    AND (n.status = 'unread' OR n.is_read = false)
    AND i.deleted_at IS NULL;
  
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
  -- منع التكرار
  SELECT COUNT(*) INTO v_count
  FROM notifications
  WHERE investor_id = p_investor_id
    AND reservation_id = p_reservation_id
    AND type = p_type
    AND created_at > now() - interval '1 minute';
  
  IF v_count > 0 THEN
    RAISE NOTICE 'إشعار مماثل موجود - تم تجاهله';
    RETURN NULL;
  END IF;
  
  INSERT INTO notifications (
    investor_id,
    reservation_id,
    type,
    title_ar,
    message_ar,
    status,
    is_read,
    priority,
    action_url,
    related_id,
    related_type
  )
  VALUES (
    p_investor_id,
    p_reservation_id,
    p_type,
    p_title,
    p_message,
    'unread',
    false,
    p_priority,
    p_action_url,
    p_reservation_id,
    'reservation'
  )
  RETURNING id INTO v_notification_id;
  
  RAISE NOTICE '✅ تم إنشاء إشعار: %', v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION log_booking_state_change(
  p_reservation_id uuid,
  p_from_status text,
  p_to_status text,
  p_changed_by_type text DEFAULT 'system',
  p_reason text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_change_id uuid;
BEGIN
  INSERT INTO booking_state_changes (
    reservation_id,
    from_status,
    to_status,
    changed_by_type,
    reason
  )
  VALUES (
    p_reservation_id,
    p_from_status,
    p_to_status,
    p_changed_by_type,
    p_reason
  )
  RETURNING id INTO v_change_id;
  
  RETURN v_change_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger لتوليد الإشعارات
CREATE OR REPLACE FUNCTION generate_booking_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_investor_id uuid;
  v_title text;
  v_message text;
  v_type text;
  v_priority text := 'normal';
BEGIN
  -- الحصول على investor_id
  SELECT i.id INTO v_investor_id
  FROM investors i
  WHERE i.phone = NEW.customer_phone 
    AND i.deleted_at IS NULL;
  
  IF v_investor_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- عند تحديث حالة الحجز
  IF (TG_OP = 'UPDATE' AND OLD.booking_status IS DISTINCT FROM NEW.booking_status) THEN
    
    -- تسجيل التغيير
    PERFORM log_booking_state_change(
      NEW.id,
      OLD.booking_status,
      NEW.booking_status,
      'system',
      'تحديث تلقائي'
    );
    
    -- تحديد نوع الإشعار والرسالة
    CASE NEW.booking_status
      WHEN 'approved' THEN
        v_type := 'booking_approved';
        v_title := '✅ تم اعتماد حجزك';
        v_message := 'مبروك! تم اعتماد حجزك. يمكنك الآن رفع إيصال السداد.';
        v_priority := 'high';
        
      WHEN 'pending_verification' THEN
        v_type := 'booking_pending_verification';
        v_title := '📩 تم استلام إيصال السداد';
        v_message := 'شكراً لإرسال إيصال السداد. سيتم التحقق منه خلال 24 ساعة.';
        v_priority := 'normal';
        
      WHEN 'verified' THEN
        v_type := 'booking_verified';
        v_title := '💰 تم التحقق من السداد';
        v_message := 'تم التحقق من إيصال السداد بنجاح!';
        v_priority := 'high';
        
      WHEN 'confirmed' THEN
        v_type := 'booking_confirmed';
        v_title := '🎉 تم تأكيد الحجز';
        v_message := 'تم تأكيد حجزك. جاري إعداد شهادة الملكية.';
        v_priority := 'high';
        
      WHEN 'certificate_issued' THEN
        v_type := 'certificate_issued';
        v_title := '🏆 شهادة ملكيتك جاهزة!';
        v_message := 'مبروك! تم إصدار شهادة ملكيتك. يمكنك تحميلها الآن.';
        v_priority := 'urgent';
        
      ELSE
        RETURN NEW;
    END CASE;
    
    -- إنشاء الإشعار
    PERFORM create_notification(
      v_investor_id,
      NEW.id,
      v_type,
      v_title,
      v_message,
      v_priority,
      NULL
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء/تحديث الـ Trigger
DROP TRIGGER IF EXISTS trigger_generate_booking_notification ON reservations;

CREATE TRIGGER trigger_generate_booking_notification
  AFTER UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION generate_booking_notification();

-- تفعيل Realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'notifications already in publication';
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE booking_state_changes;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'booking_state_changes already in publication';
END $$;

-- إعداد REPLICA IDENTITY
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER TABLE reservations REPLICA IDENTITY FULL;
ALTER TABLE booking_state_changes REPLICA IDENTITY FULL;

-- تعليقات
COMMENT ON FUNCTION create_notification IS 'إنشاء إشعار جديد مع منع التكرار';
COMMENT ON FUNCTION generate_booking_notification IS 'توليد إشعار تلقائي عند تغيير حالة الحجز';
COMMENT ON FUNCTION get_unread_notifications_count IS 'عدد الإشعارات غير المقروءة';
COMMENT ON TABLE booking_state_changes IS 'سجل Audit لتغييرات حالات الحجوزات';

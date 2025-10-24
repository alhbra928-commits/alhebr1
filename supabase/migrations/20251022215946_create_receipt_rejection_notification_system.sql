/*
  # نظام إشعارات رفض الإيصالات
  
  1. الوظيفة
    - إنشاء إشعار تلقائي للمستثمر عند رفض إيصال الدفع
    - إرسال سبب الرفض في الإشعار
    - السماح للمستثمر برفع إيصال جديد بعد الرفض
  
  2. التفاصيل
    - Trigger على payment_receipts عند تحديث الحالة لـ 'rejected'
    - إنشاء notification بنوع 'receipt_rejected'
    - تضمين سبب الرفض في الرسالة
    
  3. الأمان
    - تشغيل بصلاحيات SECURITY DEFINER
    - التحقق من وجود المستثمر
*/

-- Function to create notification when receipt is rejected
CREATE OR REPLACE FUNCTION create_receipt_rejection_notification()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_investor_id uuid;
  v_reservation_id uuid;
  v_farm_name text;
  v_rejection_reason text;
BEGIN
  -- Only proceed if status changed to rejected
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    
    -- Get reservation and investor details
    SELECT r.investor_id, r.id, f.name
    INTO v_investor_id, v_reservation_id, v_farm_name
    FROM reservations r
    LEFT JOIN farms f ON f.id = r.farm_id
    WHERE r.id = NEW.reservation_id
    AND r.deleted_at IS NULL;
    
    -- Get rejection reason
    v_rejection_reason := COALESCE(NEW.verification_notes, 'لم يتم تحديد السبب');
    
    -- Create notification if investor exists
    IF v_investor_id IS NOT NULL THEN
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        related_id,
        created_at
      ) VALUES (
        v_investor_id,
        'receipt_rejected',
        'تم رفض إيصال الدفع',
        format('تم رفض إيصال الدفع الخاص بحجزك في مزرعة "%s". السبب: %s. يمكنك رفع إيصال جديد بعد معالجة الملاحظات.', 
               v_farm_name, 
               v_rejection_reason),
        v_reservation_id,
        now()
      );
      
      RAISE NOTICE '✅ تم إنشاء إشعار رفض الإيصال للمستثمر: %', v_investor_id;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_receipt_rejection_notification ON payment_receipts;

-- Create trigger for receipt rejection
CREATE TRIGGER trigger_receipt_rejection_notification
  AFTER UPDATE ON payment_receipts
  FOR EACH ROW
  EXECUTE FUNCTION create_receipt_rejection_notification();

-- Ensure anon can read their notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'المستثمرون يمكنهم قراءة إشعاراتهم'
  ) THEN
    CREATE POLICY "المستثمرون يمكنهم قراءة إشعاراتهم"
      ON notifications
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

COMMENT ON FUNCTION create_receipt_rejection_notification() IS 'Creates notification when payment receipt is rejected';
COMMENT ON TRIGGER trigger_receipt_rejection_notification ON payment_receipts IS 'Sends rejection notification to investor';

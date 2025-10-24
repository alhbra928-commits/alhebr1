/*
  # إصلاح trigger إشعار رفض الإيصال - استخدام الأعمدة الصحيحة
  
  1. التغييرات
    - استخدام title_ar و message_ar بدلاً من title و message
    - إضافة title_en و message_en
    - إضافة investor_id مباشرة
    - إضافة reservation_id
    
  2. الأمان
    - SECURITY DEFINER للسماح بإنشاء الإشعارات
*/

-- إعادة إنشاء الدالة بالأعمدة الصحيحة
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
    SELECT r.investor_id, r.id, f.name_ar
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
        investor_id,
        reservation_id,
        type,
        title_ar,
        title_en,
        message_ar,
        message_en,
        related_id,
        related_type,
        status,
        priority,
        is_read,
        created_at
      ) VALUES (
        v_investor_id,
        v_investor_id,
        v_reservation_id,
        'receipt_rejected',
        'تم رفض إيصال الدفع',
        'Payment Receipt Rejected',
        format('تم رفض إيصال الدفع الخاص بحجزك في مزرعة "%s". السبب: %s. يمكنك رفع إيصال جديد الآن.', 
               COALESCE(v_farm_name, 'غير محدد'), 
               v_rejection_reason),
        format('Your payment receipt for "%s" farm was rejected. Reason: %s. You can upload a new receipt now.',
               COALESCE(v_farm_name, 'Unknown'),
               v_rejection_reason),
        v_reservation_id,
        'reservation',
        'unread',
        'high',
        false,
        now()
      );
      
      RAISE NOTICE '✅ تم إنشاء إشعار رفض الإيصال للمستثمر: %', v_investor_id;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION create_receipt_rejection_notification() IS 'Creates notification when payment receipt is rejected with correct column names';

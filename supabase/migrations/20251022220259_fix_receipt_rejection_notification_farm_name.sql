/*
  # إصلاح trigger إشعار رفض الإيصال
  
  1. المشكلة
    - استخدام f.name بدلاً من f.name_ar
  
  2. الحل
    - تحديث الدالة لاستخدام name_ar
*/

-- Fix the function to use correct column name
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
               COALESCE(v_farm_name, 'غير محدد'), 
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

COMMENT ON FUNCTION create_receipt_rejection_notification() IS 'Creates notification when payment receipt is rejected - Fixed to use name_ar';

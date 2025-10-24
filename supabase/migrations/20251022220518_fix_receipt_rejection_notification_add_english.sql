/*
  # إصلاح notification - إضافة النصوص الإنجليزية
  
  1. المشكلة
    - title_en و message_en مطلوبة ولكن لم يتم إضافتها
  
  2. الحل
    - إضافة النصوص الإنجليزية
*/

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
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    
    SELECT r.investor_id, r.id, f.name_ar
    INTO v_investor_id, v_reservation_id, v_farm_name
    FROM reservations r
    LEFT JOIN farms f ON f.id = r.farm_id
    WHERE r.id = NEW.reservation_id
    AND r.deleted_at IS NULL;
    
    v_rejection_reason := COALESCE(NEW.verification_notes, 'لم يتم تحديد السبب');
    
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
        format('تم رفض إيصال الدفع الخاص بحجزك في مزرعة "%s". السبب: %s. يمكنك رفع إيصال جديد بعد معالجة الملاحظات.', 
               COALESCE(v_farm_name, 'غير محدد'), 
               v_rejection_reason),
        format('Your payment receipt for farm "%s" has been rejected. Reason: %s. You can upload a new receipt after addressing the notes.', 
               COALESCE(v_farm_name, 'N/A'), 
               v_rejection_reason),
        v_reservation_id,
        'reservation',
        'active',
        'high',
        false,
        now()
      );
      
      RAISE NOTICE '✅ Notification created for investor: %', v_investor_id;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION create_receipt_rejection_notification() IS 'Creates bilingual notification when payment receipt is rejected';

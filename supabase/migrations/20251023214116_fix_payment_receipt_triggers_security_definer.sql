/*
  # إصلاح triggers إيصالات السداد - إضافة SECURITY DEFINER
  
  ## المشكلة
  - عند اعتماد إيصال سداد من الواجهة، يفشل التحديث
  - الـ trigger functions تحتاج SECURITY DEFINER لتجاوز RLS
  - المستخدم anon لا يمتلك صلاحيات التحديث المباشرة
  
  ## الحل
  - إضافة SECURITY DEFINER لجميع trigger functions المتعلقة بإيصالات السداد
  - هذا يسمح للـ triggers بتنفيذ العمليات بصلاحيات مالك الـ function
*/

-- ═══════════════════════════════════════════════════════════
-- 1. إصلاح update_reservation_after_payment_verification
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_reservation_after_payment_verification()
RETURNS TRIGGER
SECURITY DEFINER  -- ✅ إضافة SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- عند التحقق من الإيصال، تحديث حالة الدفع في الحجز
  IF NEW.status = 'verified' AND OLD.status != 'verified' THEN
    UPDATE reservations
    SET 
      payment_status = 'completed',
      booking_status = 'verified',  -- ✅ تحديث booking_status أيضاً
      updated_at = now()
    WHERE id = NEW.reservation_id;
    
    RAISE NOTICE 'Updated reservation % to payment_status=completed', NEW.reservation_id;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION update_reservation_after_payment_verification() IS 
'تحديث حالة الحجز عند اعتماد إيصال السداد - مع SECURITY DEFINER لتجاوز RLS';

-- ═══════════════════════════════════════════════════════════
-- 2. إصلاح update_payment_receipts_updated_at
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_payment_receipts_updated_at()
RETURNS TRIGGER
SECURITY DEFINER  -- ✅ إضافة SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION update_payment_receipts_updated_at() IS 
'تحديث updated_at تلقائياً - مع SECURITY DEFINER';

-- ═══════════════════════════════════════════════════════════
-- 3. إصلاح create_receipt_rejection_notification
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION create_receipt_rejection_notification()
RETURNS TRIGGER
SECURITY DEFINER  -- ✅ إضافة SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_reservation RECORD;
  v_farm_name TEXT;
BEGIN
  -- فقط عند رفض الإيصال
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    -- جلب معلومات الحجز والمزرعة
    SELECT 
      r.id,
      r.customer_name,
      r.customer_phone,
      f.name_ar as farm_name,
      f.farm_code
    INTO v_reservation
    FROM reservations r
    JOIN farms f ON r.farm_id = f.id
    WHERE r.id = NEW.reservation_id;
    
    IF FOUND THEN
      -- إنشاء إشعار للمستثمر
      INSERT INTO notifications (
        user_id,
        title_ar,
        title_en,
        message_ar,
        message_en,
        type,
        priority,
        status,
        is_read,
        related_id,
        related_type,
        action_url,
        created_at
      ) VALUES (
        NULL,  -- إشعار عام
        'تم رفض إيصال السداد',
        'Payment Receipt Rejected',
        'تم رفض إيصال السداد الخاص بحجز المزرعة ' || v_reservation.farm_name || 
        CASE WHEN NEW.verification_notes IS NOT NULL 
          THEN E'\n\nالسبب: ' || NEW.verification_notes 
          ELSE '' 
        END,
        'Payment receipt for farm ' || v_reservation.farm_name || ' has been rejected' ||
        CASE WHEN NEW.verification_notes IS NOT NULL 
          THEN E'\n\nReason: ' || NEW.verification_notes 
          ELSE '' 
        END,
        'receipt_rejected',
        'high',
        'unread',
        false,
        NEW.reservation_id,
        'reservation',
        '/investor/bookings',
        now()
      );
      
      -- تحديث حالة الحجز إلى pending_verification مرة أخرى
      UPDATE reservations
      SET 
        booking_status = 'approved',  -- العودة لحالة approved
        updated_at = now()
      WHERE id = NEW.reservation_id;
      
      RAISE NOTICE 'Created rejection notification for reservation %', NEW.reservation_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION create_receipt_rejection_notification() IS 
'إنشاء إشعار عند رفض إيصال السداد - مع SECURITY DEFINER';

-- ═══════════════════════════════════════════════════════════
-- 4. إصلاح update_booking_after_receipt
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_booking_after_receipt()
RETURNS TRIGGER
SECURITY DEFINER  -- ✅ إضافة SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- عند إضافة إيصال جديد، تحديث حالة الحجز
  UPDATE reservations
  SET 
    booking_status = 'pending_verification',
    updated_at = now()
  WHERE id = NEW.reservation_id;
  
  RAISE NOTICE 'Updated reservation % to pending_verification', NEW.reservation_id;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION update_booking_after_receipt() IS 
'تحديث حالة الحجز عند إضافة إيصال - مع SECURITY DEFINER';

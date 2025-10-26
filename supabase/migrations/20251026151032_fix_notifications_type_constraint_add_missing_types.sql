/*
  # إصلاح notifications type constraint - إضافة الأنواع الناقصة

  1. المشكلة
    - الـ constraint يحتوي على 17 نوع فقط
    - لكن الـ triggers تحاول إنشاء أنواع أخرى مثل:
      - receipt_verified
      - booking_confirmed
      - booking_created
      - ownership_completed
      - general

  2. الحل
    - إضافة جميع الأنواع المستخدمة في الـ code
    - التأكد من توافق الـ constraint مع جميع الـ triggers
*/

-- Drop existing constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add comprehensive constraint with ALL notification types
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    -- Booking related
    'booking_created',
    'booking_approved',
    'booking_rejected',
    'booking_pending_verification',
    'booking_verified',
    'booking_confirmed',
    'booking_documented',
    
    -- Payment related
    'payment_received',
    'payment_rejected',
    
    -- Receipt related
    'receipt_rejected',
    'receipt_verified',
    
    -- Certificate related
    'certificate_ready',
    'certificate_issued',
    
    -- Ownership related
    'ownership_completed',
    'documentation_created',
    
    -- Financial related
    'financial_completion',
    'farm_funding_completed',
    'owner_farm_completed',
    'investor_farm_completed',
    'finance_settlement_ready',
    
    -- General
    'general_announcement',
    'general'
  ));

COMMENT ON CONSTRAINT notifications_type_check ON notifications IS 'جميع أنواع الإشعارات المسموحة في النظام';

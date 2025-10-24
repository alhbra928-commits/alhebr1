/*
  # إضافة حقول الإحصاء المالي اللحظي

  1. الحقول الجديدة
    - collected_from_investors: المبلغ المجمع من المستثمرين
    - remaining_for_owner: المبلغ المتبقي لصاحب المزرعة
    - completion_flash_shown: هل تم عرض وميض الاكتمال
    - completion_percentage_visual: النسبة المئوية للعرض البصري
    - financial_health_status: الحالة الصحية المالية (low/medium/high/complete)
    
  2. الوظائف
    - حساب تلقائي للمبلغ المجمع
    - حساب تلقائي للمتبقي
    - تحديد الحالة البصرية
*/

-- إضافة الحقول الجديدة لـ smart_farm_finances
ALTER TABLE smart_farm_finances
ADD COLUMN IF NOT EXISTS collected_from_investors numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS remaining_for_owner numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS completion_flash_shown boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS flash_shown_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS completion_percentage_visual numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS financial_health_status text DEFAULT 'low' 
  CHECK (financial_health_status IN ('low', 'medium', 'high', 'complete'));

-- دالة حساب الإحصاء المالي اللحظي
CREATE OR REPLACE FUNCTION calculate_live_financial_stats(p_farm_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_id uuid;
  v_actual_amount numeric;
  v_collected numeric;
  v_remaining numeric;
  v_percentage numeric;
  v_status text;
  v_flash_shown boolean;
BEGIN
  -- الحصول على بيانات المزرعة
  SELECT 
    farm_id, 
    actual_amount,
    completion_flash_shown
  INTO v_farm_id, v_actual_amount, v_flash_shown
  FROM smart_farm_finances
  WHERE farm_code = p_farm_code;

  IF v_farm_id IS NULL THEN
    RETURN;
  END IF;

  -- حساب المبلغ المجمع من المستثمرين (الحجوزات المعتمدة فقط)
  SELECT COALESCE(SUM(total_amount), 0)
  INTO v_collected
  FROM reservations
  WHERE farm_id = v_farm_id
  AND booking_status = 'approved'
  AND deleted_at IS NULL;

  -- حساب المتبقي
  v_remaining := GREATEST(v_actual_amount - v_collected, 0);
  
  -- حساب النسبة المئوية
  IF v_actual_amount > 0 THEN
    v_percentage := (v_collected / v_actual_amount) * 100;
  ELSE
    v_percentage := 0;
  END IF;

  -- تحديد الحالة الصحية المالية
  IF v_percentage >= 100 THEN
    v_status := 'complete';
  ELSIF v_percentage >= 70 THEN
    v_status := 'high';
  ELSIF v_percentage >= 40 THEN
    v_status := 'medium';
  ELSE
    v_status := 'low';
  END IF;

  -- تحديث البيانات
  UPDATE smart_farm_finances
  SET
    collected_from_investors = v_collected,
    remaining_for_owner = v_remaining,
    completion_percentage_visual = v_percentage,
    financial_health_status = v_status,
    -- إذا وصلنا لـ 100% لأول مرة، نفعّل الوميض
    completion_flash_shown = CASE 
      WHEN v_percentage >= 100 AND NOT COALESCE(completion_flash_shown, false) 
      THEN true 
      ELSE completion_flash_shown 
    END,
    flash_shown_at = CASE 
      WHEN v_percentage >= 100 AND NOT COALESCE(completion_flash_shown, false) 
      THEN now() 
      ELSE flash_shown_at 
    END,
    updated_at = now()
  WHERE farm_code = p_farm_code;

  -- إذا وصلنا للاكتمال لأول مرة، نسجل حدث
  IF v_percentage >= 100 AND NOT v_flash_shown THEN
    INSERT INTO financial_base_log (
      action_type, entity_type, entity_id, entity_code,
      description_ar, new_data, source_module, status
    ) VALUES (
      'financial_update', 'farm', v_farm_id, p_farm_code,
      '🎉 تم بلوغ المبلغ الكامل لصاحب المزرعة – جاهزة للتسوية',
      jsonb_build_object(
        'collected', v_collected,
        'actual_amount', v_actual_amount,
        'percentage', v_percentage,
        'status', 'complete'
      ),
      'finance', 'success'
    );
  END IF;
END;
$$;

-- Trigger تحديث الإحصاء اللحظي عند كل حجز
CREATE OR REPLACE FUNCTION trigger_update_live_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_code text;
BEGIN
  -- الحصول على farm_code
  SELECT farm_code INTO v_farm_code
  FROM farms
  WHERE id = NEW.farm_id;

  -- تحديث الإحصاء اللحظي
  PERFORM calculate_live_financial_stats(v_farm_code);

  RETURN NEW;
END;
$$;

-- ربط Trigger بجدول reservations
DROP TRIGGER IF EXISTS trigger_live_stats_on_reservation ON reservations;
CREATE TRIGGER trigger_live_stats_on_reservation
AFTER INSERT OR UPDATE ON reservations
FOR EACH ROW
WHEN (NEW.booking_status = 'approved')
EXECUTE FUNCTION trigger_update_live_stats();

-- تحديث البيانات الحالية للمزارع الموجودة
DO $$
DECLARE
  v_farm RECORD;
BEGIN
  FOR v_farm IN SELECT DISTINCT farm_code FROM smart_farm_finances
  LOOP
    PERFORM calculate_live_financial_stats(v_farm.farm_code);
  END LOOP;
END $$;

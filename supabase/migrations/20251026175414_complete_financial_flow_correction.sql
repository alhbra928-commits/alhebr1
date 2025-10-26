/*
  # إكمال تصحيح المسار المالي
*/

-- إضافة باقي الأعمدة
ALTER TABLE farm_finance ADD COLUMN IF NOT EXISTS owner_amount_transferred numeric(15,2) DEFAULT 0 NOT NULL;
ALTER TABLE farm_finance ADD COLUMN IF NOT EXISTS platform_amount_received numeric(15,2) DEFAULT 0 NOT NULL;
ALTER TABLE farm_finance ADD COLUMN IF NOT EXISTS charity_amount_deducted numeric(15,2) DEFAULT 0 NOT NULL;

-- المراحل
ALTER TABLE farm_finance ADD COLUMN IF NOT EXISTS stage text DEFAULT 'collecting' NOT NULL;

-- حالات التسوية
ALTER TABLE farm_finance ADD COLUMN IF NOT EXISTS settlement_ready boolean DEFAULT false NOT NULL;
ALTER TABLE farm_finance ADD COLUMN IF NOT EXISTS settlement_executed boolean DEFAULT false NOT NULL;
ALTER TABLE farm_finance ADD COLUMN IF NOT EXISTS settlement_executed_by uuid;

-- التوقيتات
ALTER TABLE farm_finance ADD COLUMN IF NOT EXISTS settlement_ready_at timestamptz;
ALTER TABLE farm_finance ADD COLUMN IF NOT EXISTS settlement_executed_at timestamptz;
ALTER TABLE farm_finance ADD COLUMN IF NOT EXISTS closed_at timestamptz;

-- تحديث حالة الجاهزية للبيانات الموجودة
UPDATE farm_finance 
SET 
  settlement_ready = (collected_from_investors >= owner_amount_target),
  settlement_ready_at = CASE 
    WHEN (collected_from_investors >= owner_amount_target) THEN now()
    ELSE NULL
  END,
  stage = CASE 
    WHEN (collected_from_investors >= owner_amount_target) THEN 'ready_for_settlement'
    ELSE 'collecting'
  END
WHERE deleted_at IS NULL;

-- دالة للتحقق من الجاهزية
CREATE OR REPLACE FUNCTION check_settlement_readiness()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.collected_from_investors >= NEW.owner_amount_target AND NOT NEW.settlement_ready THEN
    NEW.settlement_ready := true;
    NEW.settlement_ready_at := now();
    NEW.stage := 'ready_for_settlement';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS trigger_check_settlement_readiness ON farm_finance;
CREATE TRIGGER trigger_check_settlement_readiness
  BEFORE UPDATE ON farm_finance
  FOR EACH ROW
  EXECUTE FUNCTION check_settlement_readiness();

-- دالة تنفيذ التسوية اليدوية
CREATE OR REPLACE FUNCTION execute_manual_settlement(
  p_farm_id uuid,
  p_admin_id uuid
)
RETURNS jsonb AS $$
DECLARE
  v_farm RECORD;
  v_txn_id text;
BEGIN
  SELECT * INTO v_farm FROM farm_finance WHERE farm_id = p_farm_id AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Farm not found');
  END IF;
  
  IF NOT v_farm.settlement_ready THEN
    RETURN jsonb_build_object('success', false, 'error', 'Settlement not ready');
  END IF;
  
  IF v_farm.settlement_executed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already executed');
  END IF;
  
  v_txn_id := 'TXN-' || to_char(now(), 'YYYYMMDD') || '-' || substring(gen_random_uuid()::text, 1, 8);
  
  UPDATE farm_finance
  SET
    stage = 'settlement_in_progress',
    settlement_executed = true,
    settlement_executed_at = now(),
    settlement_executed_by = p_admin_id,
    owner_amount_transferred = owner_amount_target,
    updated_at = now()
  WHERE farm_id = p_farm_id;
  
  INSERT INTO logs_finance (log_type, reference_type, reference_id, description, data, performed_by)
  VALUES ('settlement', 'farm', p_farm_id, 'تنفيذ التسوية المالية', 
    jsonb_build_object('transaction_id', v_txn_id, 'amount', v_farm.owner_amount_target), p_admin_id);
  
  RETURN jsonb_build_object('success', true, 'transaction_id', v_txn_id, 'amount', v_farm.owner_amount_target);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

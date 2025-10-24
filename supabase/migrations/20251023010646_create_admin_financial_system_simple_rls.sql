/*
  # نظام الإدارة المالية الشاملة - بدون RLS للإدارة
  
  1. الجداول الجديدة
    - `financial_admin_deletions_log`
    - `financial_manual_interventions_log`
    - `financial_admin_actions_log`
    
  2. التعديلات على smart_farm_finances
    
  3. RLS مبسط
*/

-- ==========================================
-- 1️⃣ سجل الحذف الإداري
-- ==========================================

CREATE TABLE IF NOT EXISTS financial_admin_deletions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deleted_record_type TEXT NOT NULL CHECK (deleted_record_type IN ('farm_finance', 'owner', 'transaction', 'charity', 'other')),
  deleted_record_id UUID NOT NULL,
  deleted_record_code TEXT,
  deleted_record_data JSONB NOT NULL,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  can_restore_until TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  deleted_by UUID,
  deleted_by_email TEXT,
  deletion_reason TEXT,
  is_restored BOOLEAN DEFAULT false,
  restored_at TIMESTAMPTZ,
  restored_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deletions_type ON financial_admin_deletions_log(deleted_record_type);
CREATE INDEX IF NOT EXISTS idx_deletions_date ON financial_admin_deletions_log(deleted_at);
CREATE INDEX IF NOT EXISTS idx_deletions_can_restore ON financial_admin_deletions_log(can_restore_until) WHERE is_restored = false;

-- ==========================================
-- 2️⃣ سجل التدخلات المالية
-- ==========================================

CREATE TABLE IF NOT EXISTS financial_manual_interventions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_code TEXT NOT NULL,
  farm_finance_id UUID REFERENCES smart_farm_finances(id),
  intervention_type TEXT NOT NULL CHECK (intervention_type IN (
    'manual_adjustment', 'force_payment', 'freeze_operations',
    'unfreeze_operations', 'manual_transfer', 'override_calculation', 'emergency_closure'
  )),
  intervention_reason TEXT NOT NULL,
  amount_before DECIMAL(15,2),
  amount_after DECIMAL(15,2),
  field_changed TEXT,
  old_value TEXT,
  new_value TEXT,
  performed_by UUID,
  performed_by_email TEXT,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  additional_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interventions_farm ON financial_manual_interventions_log(farm_code);
CREATE INDEX IF NOT EXISTS idx_interventions_type ON financial_manual_interventions_log(intervention_type);
CREATE INDEX IF NOT EXISTS idx_interventions_date ON financial_manual_interventions_log(performed_at);

-- ==========================================
-- 3️⃣ سجل الإجراءات الإدارية
-- ==========================================

CREATE TABLE IF NOT EXISTS financial_admin_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_code TEXT NOT NULL,
  farm_finance_id UUID REFERENCES smart_farm_finances(id),
  action_type TEXT NOT NULL CHECK (action_type IN (
    'approve_payment', 'transfer_profit', 'freeze_farm', 'unfreeze_farm',
    'close_sales', 'transfer_to_agriculture', 'generate_report', 'export_data'
  )),
  action_description TEXT,
  action_status TEXT DEFAULT 'completed' CHECK (action_status IN ('pending', 'completed', 'failed', 'cancelled')),
  performed_by UUID,
  performed_by_email TEXT,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  result_data JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_actions_farm ON financial_admin_actions_log(farm_code);
CREATE INDEX IF NOT EXISTS idx_actions_type ON financial_admin_actions_log(action_type);
CREATE INDEX IF NOT EXISTS idx_actions_status ON financial_admin_actions_log(action_status);
CREATE INDEX IF NOT EXISTS idx_actions_date ON financial_admin_actions_log(performed_at);

-- ==========================================
-- 4️⃣ تحديث smart_farm_finances
-- ==========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'smart_farm_finances' AND column_name = 'is_frozen') THEN
    ALTER TABLE smart_farm_finances ADD COLUMN is_frozen BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'smart_farm_finances' AND column_name = 'frozen_at') THEN
    ALTER TABLE smart_farm_finances ADD COLUMN frozen_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'smart_farm_finances' AND column_name = 'frozen_reason') THEN
    ALTER TABLE smart_farm_finances ADD COLUMN frozen_reason TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'smart_farm_finances' AND column_name = 'owner_payment_approved') THEN
    ALTER TABLE smart_farm_finances ADD COLUMN owner_payment_approved BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'smart_farm_finances' AND column_name = 'owner_payment_approved_by') THEN
    ALTER TABLE smart_farm_finances ADD COLUMN owner_payment_approved_by UUID;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'smart_farm_finances' AND column_name = 'owner_payment_approved_at') THEN
    ALTER TABLE smart_farm_finances ADD COLUMN owner_payment_approved_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'smart_farm_finances' AND column_name = 'profit_transferred') THEN
    ALTER TABLE smart_farm_finances ADD COLUMN profit_transferred BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'smart_farm_finances' AND column_name = 'profit_transferred_at') THEN
    ALTER TABLE smart_farm_finances ADD COLUMN profit_transferred_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'smart_farm_finances' AND column_name = 'transferred_to_agriculture') THEN
    ALTER TABLE smart_farm_finances ADD COLUMN transferred_to_agriculture BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'smart_farm_finances' AND column_name = 'transferred_to_agriculture_at') THEN
    ALTER TABLE smart_farm_finances ADD COLUMN transferred_to_agriculture_at TIMESTAMPTZ;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_farm_finances_frozen ON smart_farm_finances(is_frozen);
CREATE INDEX IF NOT EXISTS idx_farm_finances_approved ON smart_farm_finances(owner_payment_approved);
CREATE INDEX IF NOT EXISTS idx_farm_finances_transferred ON smart_farm_finances(profit_transferred);

-- ==========================================
-- 5️⃣ RLS - السماح بالقراءة للجميع (للإدارة)
-- ==========================================

ALTER TABLE financial_admin_deletions_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for deletions log" ON financial_admin_deletions_log FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE financial_manual_interventions_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for interventions log" ON financial_manual_interventions_log FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE financial_admin_actions_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for actions log" ON financial_admin_actions_log FOR ALL USING (true) WITH CHECK (true);

/*
  # المرحلة الثالثة: نظام التسوية والتحويل اليدوي الذكي

  1. الجداول الجديدة
    - investors_wallet: محفظة المستثمرين المركزية
    - charity_wallet: محفظة الخير
    - platform_wallet: محفظة المنصة
    - settlement_transactions: سجل معاملات التسوية
    - financial_audit_log: سجل التدقيق المالي الكامل

  2. الحقول الجديدة
    - حالة التسوية للمزارع
    - حالة القفل المالي
    - تاريخ التسويات

  3. الدوال
    - execute_manual_settlement: تنفيذ التسوية اليدوية
    - close_farm_ownership: إقفال ملكية المزرعة
    - distribute_profits: توزيع الأرباح
*/

-- 1️⃣ محفظة المستثمرين المركزية
CREATE TABLE IF NOT EXISTS investors_wallet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id),
  farm_code text NOT NULL,
  farm_name text NOT NULL,
  
  total_collected numeric DEFAULT 0,
  total_pending numeric DEFAULT 0,
  total_transferred_to_owner numeric DEFAULT 0,
  
  status text DEFAULT 'collecting' CHECK (status IN ('collecting', 'ready_for_settlement', 'settled', 'closed')),
  is_locked boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  
  UNIQUE(farm_code)
);

-- 2️⃣ محفظة الخير
CREATE TABLE IF NOT EXISTS charity_wallet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  total_balance numeric DEFAULT 0,
  total_received numeric DEFAULT 0,
  total_distributed numeric DEFAULT 0,
  
  farms_contributed integer DEFAULT 0,
  last_contribution_date timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء صف واحد فقط لمحفظة الخير
INSERT INTO charity_wallet (id) 
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- 3️⃣ محفظة المنصة
CREATE TABLE IF NOT EXISTS platform_wallet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  total_balance numeric DEFAULT 0,
  total_received numeric DEFAULT 0,
  total_transferred_to_charity numeric DEFAULT 0,
  
  farms_owned integer DEFAULT 0,
  total_profit numeric DEFAULT 0,
  net_profit numeric DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء صف واحد فقط لمحفظة المنصة
INSERT INTO platform_wallet (id) 
VALUES ('00000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- 4️⃣ سجل معاملات التسوية
CREATE TABLE IF NOT EXISTS settlement_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_code text UNIQUE NOT NULL,
  
  farm_id uuid NOT NULL REFERENCES farms(id),
  farm_code text NOT NULL,
  
  transaction_type text NOT NULL CHECK (transaction_type IN (
    'collection',           -- تجميع من المستثمرين
    'settlement_to_owner',  -- تسوية لصاحب المزرعة
    'profit_to_platform',   -- ربح للمنصة
    'charity_deduction'     -- استقطاع الخير
  )),
  
  amount numeric NOT NULL,
  from_wallet text NOT NULL,
  to_wallet text NOT NULL,
  
  executed_by_id text,
  executed_by_name text,
  execution_method text DEFAULT 'manual' CHECK (execution_method IN ('manual', 'automatic')),
  
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  
  description_ar text,
  description_en text,
  
  metadata jsonb,
  
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- 5️⃣ سجل التدقيق المالي الكامل (غير قابل للتعديل/الحذف)
CREATE TABLE IF NOT EXISTS financial_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_code text UNIQUE NOT NULL,
  
  timestamp timestamptz DEFAULT now(),
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  entity_code text,
  
  from_wallet text,
  to_wallet text,
  amount numeric,
  
  executed_by_id text,
  executed_by_name text,
  
  description_ar text NOT NULL,
  description_en text,
  
  metadata jsonb,
  
  status text DEFAULT 'success' CHECK (status IN ('success', 'failed', 'pending')),
  
  created_at timestamptz DEFAULT now()
);

-- منع الحذف والتحديث من سجل التدقيق
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'سجل التدقيق المالي غير قابل للتعديل أو الحذف';
  RETURN NULL;
END;
$$;

CREATE TRIGGER prevent_audit_log_update
BEFORE UPDATE ON financial_audit_log
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_modification();

CREATE TRIGGER prevent_audit_log_delete
BEFORE DELETE ON financial_audit_log
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_modification();

-- 6️⃣ إضافة حقول التسوية لجدول المزارع
ALTER TABLE smart_farm_finances
ADD COLUMN IF NOT EXISTS settlement_status text DEFAULT 'collecting' 
  CHECK (settlement_status IN ('collecting', 'ready_for_settlement', 'settling', 'settled', 'owned_by_platform')),
ADD COLUMN IF NOT EXISTS settlement_ready_at timestamptz,
ADD COLUMN IF NOT EXISTS settlement_executed_at timestamptz,
ADD COLUMN IF NOT EXISTS settlement_executed_by_id text,
ADD COLUMN IF NOT EXISTS settlement_executed_by_name text,
ADD COLUMN IF NOT EXISTS farm_ownership_status text DEFAULT 'owner' 
  CHECK (farm_ownership_status IN ('owner', 'platform', 'closed')),
ADD COLUMN IF NOT EXISTS investors_locked_for_settlement boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS profit_distributed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS charity_distributed boolean DEFAULT false;

-- 7️⃣ Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_investors_wallet_farm_code ON investors_wallet(farm_code);
CREATE INDEX IF NOT EXISTS idx_investors_wallet_status ON investors_wallet(status);
CREATE INDEX IF NOT EXISTS idx_settlement_transactions_farm_code ON settlement_transactions(farm_code);
CREATE INDEX IF NOT EXISTS idx_settlement_transactions_type ON settlement_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_financial_audit_log_entity_code ON financial_audit_log(entity_code);
CREATE INDEX IF NOT EXISTS idx_financial_audit_log_timestamp ON financial_audit_log(timestamp);

-- 8️⃣ RLS Policies
ALTER TABLE investors_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_audit_log ENABLE ROW LEVEL SECURITY;

-- قراءة عامة للمحافظ (للإحصاءات)
CREATE POLICY "Allow read access to wallets" ON investors_wallet FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow read access to charity" ON charity_wallet FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow read access to platform" ON platform_wallet FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow read access to transactions" ON settlement_transactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow read access to audit log" ON financial_audit_log FOR SELECT TO anon, authenticated USING (true);

-- التحديث للمحافظ (داخلي فقط من الدوال)
CREATE POLICY "Allow internal wallet updates" ON investors_wallet FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow internal charity updates" ON charity_wallet FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow internal platform updates" ON platform_wallet FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow internal transaction creation" ON settlement_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow internal audit log creation" ON financial_audit_log FOR INSERT TO authenticated WITH CHECK (true);

/*
  # إنشاء النظام المالي المتكامل V3 (financial_core_v3)
  
  ## الجداول:
  1. wallets - المحافظ المالية
  2. transactions - العمليات المالية
  3. farm_finance - البيانات المالية للمزارع (مع حساب الربح تلقائياً)
  4. investor_finance - مساهمات المستثمرين
  5. platform_revenue - أرباح المنصة
  6. charity_wallet - محفظة الخير (25% من الأرباح)
  7. logs_finance - السجل المالي
*/

-- ============================================================================
-- 1. WALLETS المحافظ المالية
-- ============================================================================

CREATE TABLE wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_type text NOT NULL,
  entity_id uuid,
  entity_type text,
  current_balance numeric(15,2) DEFAULT 0 NOT NULL,
  total_received numeric(15,2) DEFAULT 0 NOT NULL,
  total_spent numeric(15,2) DEFAULT 0 NOT NULL,
  transactions_count integer DEFAULT 0 NOT NULL,
  last_transaction_at timestamptz,
  status text DEFAULT 'active' NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  deleted_at timestamptz
);

CREATE INDEX idx_wallets_v3_type ON wallets(wallet_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_wallets_v3_entity ON wallets(entity_id) WHERE deleted_at IS NULL;

-- ============================================================================
-- 2. TRANSACTIONS العمليات المالية
-- ============================================================================

CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text UNIQUE NOT NULL DEFAULT 'TXN-' || to_char(now(), 'YYYYMMDD') || '-' || substring(gen_random_uuid()::text, 1, 8),
  transaction_type text NOT NULL,
  amount numeric(15,2) NOT NULL,
  from_wallet_id uuid REFERENCES wallets(id),
  to_wallet_id uuid REFERENCES wallets(id),
  reference_type text,
  reference_id uuid,
  description_ar text,
  description_en text,
  status text DEFAULT 'pending' NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  executed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  deleted_at timestamptz
);

CREATE INDEX idx_transactions_v3_type ON transactions(transaction_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_v3_status ON transactions(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_v3_ref ON transactions(reference_type, reference_id) WHERE deleted_at IS NULL;

-- ============================================================================
-- 3. FARM_FINANCE البيانات المالية للمزارع
-- ============================================================================

CREATE TABLE farm_finance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  farm_code text NOT NULL,
  farm_name text NOT NULL,
  
  -- الأسعار (من أقسام أخرى)
  actual_price numeric(15,2) NOT NULL,      -- من إدارة صاحب المزرعة
  marketing_price numeric(15,2) NOT NULL,   -- من إدارة المزارع
  
  -- الربح المحسوب تلقائياً
  net_profit numeric(15,2) GENERATED ALWAYS AS (marketing_price - actual_price) STORED,
  profit_percentage numeric(5,2) GENERATED ALWAYS AS (
    CASE WHEN actual_price > 0 THEN ((marketing_price - actual_price) / actual_price * 100) ELSE 0 END
  ) STORED,
  
  -- الإيرادات والإحصائيات
  total_revenue_collected numeric(15,2) DEFAULT 0 NOT NULL,
  total_investors integer DEFAULT 0 NOT NULL,
  total_trees_sold integer DEFAULT 0 NOT NULL,
  financial_completion_percentage numeric(5,2) DEFAULT 0 NOT NULL,
  
  -- الحالة المالية
  financial_status text DEFAULT 'collecting' NOT NULL,
  settled_at timestamptz,
  settlement_transaction_id text,
  
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  deleted_at timestamptz,
  
  UNIQUE (farm_id)
);

CREATE INDEX idx_farm_finance_v3_farm ON farm_finance(farm_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_farm_finance_v3_status ON farm_finance(financial_status) WHERE deleted_at IS NULL;

-- ============================================================================
-- 4. INVESTOR_FINANCE مساهمات المستثمرين
-- ============================================================================

CREATE TABLE investor_finance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  investor_phone text NOT NULL,
  investor_name text NOT NULL,
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  farm_code text NOT NULL,
  reservation_id uuid REFERENCES reservations(id),
  number_of_trees integer NOT NULL,
  price_per_tree numeric(15,2) NOT NULL,
  total_investment numeric(15,2) GENERATED ALWAYS AS (number_of_trees * price_per_tree) STORED,
  payment_status text DEFAULT 'pending' NOT NULL,
  amount_paid numeric(15,2) DEFAULT 0 NOT NULL,
  investment_date timestamptz DEFAULT now() NOT NULL,
  payment_completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  deleted_at timestamptz
);

CREATE INDEX idx_investor_finance_v3_investor ON investor_finance(investor_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_investor_finance_v3_farm ON investor_finance(farm_id) WHERE deleted_at IS NULL;

-- ============================================================================
-- 5. PLATFORM_REVENUE أرباح المنصة
-- ============================================================================

CREATE TABLE platform_revenue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  farm_code text NOT NULL,
  gross_profit numeric(15,2) NOT NULL,
  charity_amount numeric(15,2) NOT NULL,
  net_profit numeric(15,2) GENERATED ALWAYS AS (gross_profit - charity_amount) STORED,
  actual_price numeric(15,2) NOT NULL,
  marketing_price numeric(15,2) NOT NULL,
  revenue_date timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  deleted_at timestamptz,
  UNIQUE (farm_id)
);

CREATE INDEX idx_platform_revenue_v3_farm ON platform_revenue(farm_id) WHERE deleted_at IS NULL;

-- ============================================================================
-- 6. CHARITY_WALLET محفظة الخير
-- ============================================================================

CREATE TABLE charity_wallet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_balance numeric(15,2) DEFAULT 0 NOT NULL,
  total_received numeric(15,2) DEFAULT 0 NOT NULL,
  total_distributed numeric(15,2) DEFAULT 0 NOT NULL,
  farms_contributed integer DEFAULT 0 NOT NULL,
  transactions_count integer DEFAULT 0 NOT NULL,
  last_contribution_at timestamptz,
  last_distribution_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- 7. LOGS_FINANCE السجل المالي
-- ============================================================================

CREATE TABLE logs_finance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_type text NOT NULL,
  reference_type text,
  reference_id uuid,
  description text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  performed_by uuid,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_logs_finance_v3_type ON logs_finance(log_type);
CREATE INDEX idx_logs_finance_v3_created ON logs_finance(created_at DESC);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_finance ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_finance ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_finance ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "wallets_public_select" ON wallets FOR SELECT TO anon USING (true);
CREATE POLICY "transactions_public_select" ON transactions FOR SELECT TO anon USING (true);
CREATE POLICY "farm_finance_public_select" ON farm_finance FOR SELECT TO anon USING (true);
CREATE POLICY "investor_finance_public_select" ON investor_finance FOR SELECT TO anon USING (true);
CREATE POLICY "platform_revenue_public_select" ON platform_revenue FOR SELECT TO anon USING (true);
CREATE POLICY "charity_wallet_public_select" ON charity_wallet FOR SELECT TO anon USING (true);
CREATE POLICY "logs_finance_public_select" ON logs_finance FOR SELECT TO anon USING (true);

-- Authenticated full access
CREATE POLICY "wallets_auth_all" ON wallets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "transactions_auth_all" ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "farm_finance_auth_all" ON farm_finance FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "investor_finance_auth_all" ON investor_finance FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "platform_revenue_auth_all" ON platform_revenue FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "charity_wallet_auth_all" ON charity_wallet FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "logs_finance_auth_all" ON logs_finance FOR ALL TO authenticated USING (true) WITH CHECK (true);

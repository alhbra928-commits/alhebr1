/*
  # نظام الإصلاح المالي الشامل - مرحلة 1

  1. إنشاء جداول الاسترجاع والتصحيح
    - temp_recovery: لحفظ البيانات غير الصحيحة
    - corrections_log: سجل التصحيحات
    - finance_audit_log: سجل المراجعة المالية

  2. إنشاء جدول موحد للمحافظ
    - unified_wallets: محفظة موحدة لجميع الأطراف
*/

-- ═══════════════════════════════════════════════════════════
-- 1. جدول temp_recovery: لحفظ البيانات المؤقتة
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS temp_recovery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table TEXT NOT NULL,
  source_id UUID,
  data_snapshot JSONB NOT NULL,
  issue_description TEXT,
  recovery_status TEXT DEFAULT 'pending' CHECK (recovery_status IN ('pending', 'reviewed', 'corrected', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID
);

CREATE INDEX IF NOT EXISTS idx_temp_recovery_source ON temp_recovery(source_table);
CREATE INDEX IF NOT EXISTS idx_temp_recovery_status ON temp_recovery(recovery_status);

COMMENT ON TABLE temp_recovery IS 'جدول مؤقت لحفظ البيانات غير الصحيحة قبل التصحيح';

-- ═══════════════════════════════════════════════════════════
-- 2. جدول corrections_log: سجل التصحيحات
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS corrections_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correction_type TEXT NOT NULL,
  table_affected TEXT NOT NULL,
  record_id UUID,
  old_value JSONB,
  new_value JSONB,
  correction_reason TEXT,
  deviation_amount NUMERIC DEFAULT 0,
  corrected_by TEXT DEFAULT 'system',
  correction_date TIMESTAMPTZ DEFAULT now(),
  verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_corrections_table ON corrections_log(table_affected);
CREATE INDEX IF NOT EXISTS idx_corrections_date ON corrections_log(correction_date);

COMMENT ON TABLE corrections_log IS 'سجل جميع التصحيحات المالية مع التاريخ والمسؤول';

-- ═══════════════════════════════════════════════════════════
-- 3. جدول finance_audit_log: سجل المراجعة المالية
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS finance_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_date TIMESTAMPTZ DEFAULT now(),
  audit_type TEXT NOT NULL CHECK (audit_type IN ('daily', 'weekly', 'monthly', 'recovery', 'manual')),
  total_revenue_found NUMERIC DEFAULT 0,
  total_expenses_found NUMERIC DEFAULT 0,
  total_profit_calculated NUMERIC DEFAULT 0,
  total_charity_calculated NUMERIC DEFAULT 0,
  discrepancies_found INTEGER DEFAULT 0,
  discrepancies_resolved INTEGER DEFAULT 0,
  audit_status TEXT DEFAULT 'in_progress' CHECK (audit_status IN ('in_progress', 'completed', 'failed')),
  audit_notes TEXT,
  audited_by TEXT DEFAULT 'system',
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_audit_date ON finance_audit_log(audit_date);
CREATE INDEX IF NOT EXISTS idx_audit_status ON finance_audit_log(audit_status);

COMMENT ON TABLE finance_audit_log IS 'سجل مراجعة مالية شامل لجميع العمليات';

-- ═══════════════════════════════════════════════════════════
-- 4. جدول unified_wallets: محفظة موحدة
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS unified_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_type TEXT NOT NULL CHECK (wallet_type IN ('investor', 'farm_owner', 'platform', 'charity')),
  entity_id UUID,
  entity_reference TEXT,
  balance NUMERIC DEFAULT 0 CHECK (balance >= 0),
  total_credits NUMERIC DEFAULT 0,
  total_debits NUMERIC DEFAULT 0,
  last_transaction_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(wallet_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_unified_wallets_type ON unified_wallets(wallet_type);
CREATE INDEX IF NOT EXISTS idx_unified_wallets_entity ON unified_wallets(entity_id);
CREATE INDEX IF NOT EXISTS idx_unified_wallets_status ON unified_wallets(status);

COMMENT ON TABLE unified_wallets IS 'نظام محافظ موحد لجميع الأطراف (مستثمرين، أصحاب مزارع، منصة، صدقة)';

-- ═══════════════════════════════════════════════════════════
-- 5. جدول unified_transactions: معاملات موحدة
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS unified_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date TIMESTAMPTZ DEFAULT now(),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'investor_deposit',
    'owner_revenue',
    'platform_profit',
    'charity_contribution',
    'settlement',
    'refund',
    'correction'
  )),
  from_wallet_id UUID REFERENCES unified_wallets(id),
  to_wallet_id UUID REFERENCES unified_wallets(id),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  description_ar TEXT,
  description_en TEXT,
  farm_code TEXT,
  reservation_id UUID,
  investor_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  CHECK (from_wallet_id IS NOT NULL OR to_wallet_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_unified_trans_date ON unified_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_unified_trans_type ON unified_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_unified_trans_from ON unified_transactions(from_wallet_id);
CREATE INDEX IF NOT EXISTS idx_unified_trans_to ON unified_transactions(to_wallet_id);
CREATE INDEX IF NOT EXISTS idx_unified_trans_farm ON unified_transactions(farm_code);

COMMENT ON TABLE unified_transactions IS 'جميع المعاملات المالية في نظام موحد وواضح';

-- ═══════════════════════════════════════════════════════════
-- 6. Function: حفظ البيانات الحالية في temp_recovery
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION backup_current_financial_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- حفظ farm_wallets
  INSERT INTO temp_recovery (source_table, source_id, data_snapshot, issue_description)
  SELECT 
    'farm_wallets',
    id,
    row_to_json(farm_wallets.*),
    'Original farm wallet data before correction'
  FROM farm_wallets;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  -- حفظ farm_financial_transactions
  INSERT INTO temp_recovery (source_table, source_id, data_snapshot, issue_description)
  SELECT 
    'farm_financial_transactions',
    id,
    row_to_json(farm_financial_transactions.*),
    'Original transaction data before correction'
  FROM farm_financial_transactions;
  
  -- حفظ smart_farm_finances
  INSERT INTO temp_recovery (source_table, source_id, data_snapshot, issue_description)
  SELECT 
    'smart_farm_finances',
    id,
    row_to_json(smart_farm_finances.*),
    'Original smart finance data before correction'
  FROM smart_farm_finances
  WHERE deleted_at IS NULL;
  
  RAISE NOTICE 'Backed up financial data. Total records: %', v_count;
  
  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION backup_current_financial_data IS 'حفظ جميع البيانات المالية الحالية في temp_recovery قبل التصحيح';

-- ═══════════════════════════════════════════════════════════
-- 7. Function: تحليل الانحرافات والمشاكل
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION analyze_financial_discrepancies()
RETURNS TABLE (
  issue_type TEXT,
  affected_records INTEGER,
  total_deviation NUMERIC,
  severity TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH discrepancies AS (
    -- فحص farm_wallets
    SELECT 
      'farm_wallets_unrealistic_balance' as issue_type,
      COUNT(*)::INTEGER as affected_records,
      SUM(balance) as total_deviation,
      CASE 
        WHEN SUM(balance) > 100000000 THEN 'CRITICAL'
        WHEN SUM(balance) > 10000000 THEN 'HIGH'
        ELSE 'MEDIUM'
      END as severity
    FROM farm_wallets
    WHERE balance > 100000000
    
    UNION ALL
    
    -- فحص owner_payment_due غير منطقي
    SELECT 
      'owner_payment_unrealistic',
      COUNT(*)::INTEGER,
      SUM(owner_payment_due),
      'CRITICAL'
    FROM farm_wallets
    WHERE owner_payment_due > 50000000
    
    UNION ALL
    
    -- فحص المعاملات المكررة
    SELECT 
      'duplicate_transactions',
      COUNT(*)::INTEGER,
      SUM(amount),
      'HIGH'
    FROM (
      SELECT amount, transaction_type, COUNT(*) as dup_count
      FROM farm_financial_transactions
      GROUP BY amount, transaction_type, DATE_TRUNC('minute', created_at)
      HAVING COUNT(*) > 1
    ) dups
  )
  SELECT * FROM discrepancies;
END;
$$;

COMMENT ON FUNCTION analyze_financial_discrepancies IS 'تحليل جميع الانحرافات والمشاكل المالية في النظام';

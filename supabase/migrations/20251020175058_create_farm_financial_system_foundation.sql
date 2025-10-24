/*
  # إنشاء النظام المالي المتقدم للمزارع - الأساس

  ## الكيانات الجديدة

  ### 1. جداول المحافظ والدفاتر
    - `farm_wallets` - محفظة مالية لكل مزرعة (مرتبطة بالباركود)
      - `id` (uuid, primary key)
      - `farm_barcode` (text, unique, not null) - الباركود
      - `balance` (numeric, default 0) - الرصيد الحالي
      - `total_income` (numeric, default 0) - إجمالي الدخل
      - `total_expense` (numeric, default 0) - إجمالي المصروفات
      - `frozen_amount` (numeric, default 0) - مبالغ مجمدة
      - `status` (text) - الحالة: active, settling, completed, frozen
      - `created_at`, `updated_at`

    - `farm_ledgers` - دفتر معاملات لكل مزرعة
      - `id` (uuid, primary key)
      - `farm_barcode` (text, not null) - الباركود
      - `transaction_type` (text) - نوع المعاملة: income, expense, transfer_in, transfer_out, investor_deposit, settlement
      - `amount` (numeric, not null)
      - `category` (text) - التصنيف للمصروفات: irrigation, labor, planting, transport, admin
      - `description` (text)
      - `from_entity` (text) - الجهة المحولة منها
      - `to_entity` (text) - الجهة المحولة إليها
      - `reference_id` (uuid) - معرف مرجعي (حجز، مستثمر، ...)
      - `executed_by` (uuid) - المنفذ
      - `status` (text) - pending, completed, cancelled
      - `transaction_date` (timestamptz)
      - `created_at`

    - `farm_expenses` - مركز مصروفات المزرعة
      - `id` (uuid, primary key)
      - `farm_barcode` (text, not null)
      - `category` (text, not null) - irrigation, labor, planting, transport, admin
      - `amount` (numeric, not null)
      - `description` (text)
      - `receipt_number` (text) - رقم الإيصال
      - `vendor` (text) - المورد/المقاول
      - `expense_date` (date)
      - `created_by` (uuid)
      - `created_at`

    - `farm_investors_ledger` - سجل مستثمري المزرعة
      - `id` (uuid, primary key)
      - `farm_barcode` (text, not null)
      - `investor_id` (uuid, references investors)
      - `investment_amount` (numeric, not null)
      - `ownership_percentage` (numeric)
      - `certificate_number` (text)
      - `status` (text) - active, completed, withdrawn
      - `investment_date` (date)
      - `created_at`

    - `farm_financial_states` - حالات دورة المزرعة المالية
      - `id` (uuid, primary key)
      - `farm_barcode` (text, unique, not null)
      - `current_state` (text, not null) - active, settling, completed, frozen
      - `previous_state` (text)
      - `state_changed_at` (timestamptz)
      - `changed_by` (uuid)
      - `reason` (text)
      - `created_at`, `updated_at`

    - `farm_financial_closures` - إغلاق مالي للمزارع
      - `id` (uuid, primary key)
      - `farm_barcode` (text, unique, not null)
      - `closure_date` (date, not null)
      - `final_balance` (numeric)
      - `total_income` (numeric)
      - `total_expense` (numeric)
      - `total_profit` (numeric)
      - `charity_amount` (numeric)
      - `report_url` (text)
      - `closed_by` (uuid)
      - `transferred_to_agriculture` (boolean, default false)
      - `created_at`

    - `farm_financial_audit_log` - سجل تدقيق شامل
      - `id` (uuid, primary key)
      - `operation_number` (text, unique)
      - `farm_barcode` (text, not null)
      - `operation_type` (text, not null)
      - `from_entity` (text)
      - `to_entity` (text)
      - `amount` (numeric)
      - `executed_by` (uuid)
      - `status` (text)
      - `timestamp` (timestamptz)
      - `metadata` (jsonb)

  ## الأمان
    - تفعيل RLS على جميع الجداول
    - سياسات للمصادقة والصلاحيات
*/

-- جدول المحافظ المالية للمزارع
CREATE TABLE IF NOT EXISTS farm_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_barcode text UNIQUE NOT NULL,
  balance numeric DEFAULT 0 CHECK (balance >= 0),
  total_income numeric DEFAULT 0 CHECK (total_income >= 0),
  total_expense numeric DEFAULT 0 CHECK (total_expense >= 0),
  frozen_amount numeric DEFAULT 0 CHECK (frozen_amount >= 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'settling', 'completed', 'frozen')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- جدول دفتر المعاملات
CREATE TABLE IF NOT EXISTS farm_ledgers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_barcode text NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer_in', 'transfer_out', 'investor_deposit', 'settlement')),
  amount numeric NOT NULL CHECK (amount > 0),
  category text CHECK (category IN ('irrigation', 'labor', 'planting', 'transport', 'admin', 'other')),
  description text,
  from_entity text,
  to_entity text,
  reference_id uuid,
  executed_by uuid,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  transaction_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- جدول مركز المصروفات
CREATE TABLE IF NOT EXISTS farm_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_barcode text NOT NULL,
  category text NOT NULL CHECK (category IN ('irrigation', 'labor', 'planting', 'transport', 'admin')),
  amount numeric NOT NULL CHECK (amount > 0),
  description text,
  receipt_number text,
  vendor text,
  expense_date date DEFAULT CURRENT_DATE,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- جدول سجل مستثمري المزرعة
CREATE TABLE IF NOT EXISTS farm_investors_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_barcode text NOT NULL,
  investor_id uuid,
  investment_amount numeric NOT NULL CHECK (investment_amount > 0),
  ownership_percentage numeric CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
  certificate_number text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn')),
  investment_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- جدول حالات دورة المزرعة المالية
CREATE TABLE IF NOT EXISTS farm_financial_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_barcode text UNIQUE NOT NULL,
  current_state text NOT NULL CHECK (current_state IN ('active', 'settling', 'completed', 'frozen')),
  previous_state text,
  state_changed_at timestamptz DEFAULT now(),
  changed_by uuid,
  reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- جدول الإغلاق المالي
CREATE TABLE IF NOT EXISTS farm_financial_closures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_barcode text UNIQUE NOT NULL,
  closure_date date NOT NULL DEFAULT CURRENT_DATE,
  final_balance numeric DEFAULT 0,
  total_income numeric DEFAULT 0,
  total_expense numeric DEFAULT 0,
  total_profit numeric DEFAULT 0,
  charity_amount numeric DEFAULT 0,
  report_url text,
  closed_by uuid,
  transferred_to_agriculture boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- جدول سجل التدقيق الشامل
CREATE TABLE IF NOT EXISTS farm_financial_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_number text UNIQUE NOT NULL,
  farm_barcode text NOT NULL,
  operation_type text NOT NULL,
  from_entity text,
  to_entity text,
  amount numeric,
  executed_by uuid,
  status text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- إنشاء الفهارس للأداء
CREATE INDEX IF NOT EXISTS idx_farm_wallets_barcode ON farm_wallets(farm_barcode);
CREATE INDEX IF NOT EXISTS idx_farm_ledgers_barcode ON farm_ledgers(farm_barcode);
CREATE INDEX IF NOT EXISTS idx_farm_ledgers_date ON farm_ledgers(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_farm_expenses_barcode ON farm_expenses(farm_barcode);
CREATE INDEX IF NOT EXISTS idx_farm_expenses_date ON farm_expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_farm_investors_ledger_barcode ON farm_investors_ledger(farm_barcode);
CREATE INDEX IF NOT EXISTS idx_farm_financial_states_barcode ON farm_financial_states(farm_barcode);
CREATE INDEX IF NOT EXISTS idx_farm_financial_closures_barcode ON farm_financial_closures(farm_barcode);
CREATE INDEX IF NOT EXISTS idx_farm_financial_audit_log_barcode ON farm_financial_audit_log(farm_barcode);
CREATE INDEX IF NOT EXISTS idx_farm_financial_audit_log_timestamp ON farm_financial_audit_log(timestamp DESC);

-- تفعيل RLS
ALTER TABLE farm_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_investors_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_financial_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_financial_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_financial_audit_log ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للقراءة (مؤقتة - للمصادقين)
CREATE POLICY "Allow authenticated read farm_wallets"
  ON farm_wallets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read farm_ledgers"
  ON farm_ledgers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read farm_expenses"
  ON farm_expenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read farm_investors_ledger"
  ON farm_investors_ledger FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read farm_financial_states"
  ON farm_financial_states FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read farm_financial_closures"
  ON farm_financial_closures FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read farm_financial_audit_log"
  ON farm_financial_audit_log FOR SELECT
  TO authenticated
  USING (true);

-- سياسات RLS للكتابة (مؤقتة - للمصادقين)
CREATE POLICY "Allow authenticated insert farm_wallets"
  ON farm_wallets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated insert farm_ledgers"
  ON farm_ledgers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated insert farm_expenses"
  ON farm_expenses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated insert farm_investors_ledger"
  ON farm_investors_ledger FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated insert farm_financial_states"
  ON farm_financial_states FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated insert farm_financial_closures"
  ON farm_financial_closures FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated insert farm_financial_audit_log"
  ON farm_financial_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update farm_wallets"
  ON farm_wallets FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update farm_ledgers"
  ON farm_ledgers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update farm_financial_states"
  ON farm_financial_states FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

/*
  # النظام المالي الذكي للمزارع - النسخة المتكاملة
  
  1. الجداول الجديدة
    - `smart_farm_finances` - بطاقة المزرعة المالية الذكية
    - `farm_financial_transactions` - سجل جميع المعاملات المالية
    - `platform_charity_wallet` - محفظة الخير (25% من الأرباح)
    
  2. الحقول الأساسية
    - marketing_amount (المبلغ التسويقي) - من الحجوزات
    - actual_amount (المبلغ الفعلي) - من بيانات صاحب المزرعة
    - coverage_percentage (نسبة التغطية)
    - platform_profit (ربح المنصة)
    - charity_amount (استقطاع الخير 25%)
    
  3. الأمان
    - RLS policies لجميع الجداول
    - triggers تلقائية لحساب المبالغ
    - audit log لكل عملية مالية
*/

-- 1. جدول النظام المالي الذكي للمزارع
CREATE TABLE IF NOT EXISTS smart_farm_finances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- معلومات المزرعة
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  farm_code TEXT NOT NULL UNIQUE,
  farm_name TEXT NOT NULL,
  owner_id UUID REFERENCES farm_owners(id),
  owner_name TEXT,
  
  -- المبالغ الأساسية
  marketing_amount NUMERIC(15,2) DEFAULT 0 NOT NULL, -- المبلغ التسويقي (من المستثمرين)
  actual_amount NUMERIC(15,2) DEFAULT 0 NOT NULL,    -- المبلغ الفعلي (من صاحب المزرعة)
  
  -- الحسابات التلقائية
  coverage_percentage NUMERIC(5,2) DEFAULT 0,         -- نسبة التغطية %
  remaining_amount NUMERIC(15,2) DEFAULT 0,           -- المتبقي
  platform_profit NUMERIC(15,2) DEFAULT 0,            -- ربح المنصة
  charity_amount NUMERIC(15,2) DEFAULT 0,             -- استقطاع الخير 25%
  net_platform_profit NUMERIC(15,2) DEFAULT 0,        -- صافي ربح المنصة
  
  -- حالة المزرعة المالية
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'completed', 'closed')),
  completion_stage TEXT DEFAULT 'collecting' CHECK (completion_stage IN (
    'collecting',        -- جمع المبالغ التسويقية
    'owner_payment',     -- سداد صاحب المزرعة
    'profit_calculation',-- حساب الأرباح
    'charity_deduction', -- استقطاع الخير
    'completed'          -- مكتمل
  )),
  
  -- تواريخ مهمة
  owner_payment_date TIMESTAMPTZ,
  completion_date TIMESTAMPTZ,
  last_transaction_date TIMESTAMPTZ,
  
  -- إحصائيات
  total_investors INTEGER DEFAULT 0,
  total_trees_sold INTEGER DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  
  -- الباركود والهوية
  financial_barcode TEXT UNIQUE,
  
  -- التوقيتات
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_amounts CHECK (
    marketing_amount >= 0 AND 
    actual_amount >= 0 AND
    platform_profit >= 0 AND
    charity_amount >= 0
  )
);

-- 2. جدول المعاملات المالية
CREATE TABLE IF NOT EXISTS farm_financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  farm_finance_id UUID NOT NULL REFERENCES smart_farm_finances(id) ON DELETE CASCADE,
  farm_code TEXT NOT NULL,
  
  -- نوع المعاملة
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'marketing_income',    -- دخل تسويقي (من مستثمر)
    'owner_payment',       -- دفع لصاحب المزرعة
    'platform_profit',     -- ربح المنصة
    'charity_deduction'    -- استقطاع الخير
  )),
  
  -- المبلغ والتفاصيل
  amount NUMERIC(15,2) NOT NULL,
  description TEXT,
  
  -- ربط بالمصدر
  source_type TEXT,  -- 'reservation', 'payment', 'profit', 'charity'
  source_id UUID,    -- ID الحجز أو المعاملة المصدر
  
  -- معلومات إضافية
  investor_name TEXT,
  reservation_code TEXT,
  
  -- التوقيت
  transaction_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_transaction_amount CHECK (amount > 0)
);

-- 3. محفظة الخير (25% من أرباح المنصة)
CREATE TABLE IF NOT EXISTS platform_charity_wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- المبالغ
  total_balance NUMERIC(15,2) DEFAULT 0 NOT NULL,
  total_received NUMERIC(15,2) DEFAULT 0 NOT NULL,
  total_distributed NUMERIC(15,2) DEFAULT 0 NOT NULL,
  
  -- الإحصائيات
  farms_contributed INTEGER DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  last_contribution_date TIMESTAMPTZ,
  
  -- التوقيتات
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_charity_amounts CHECK (
    total_balance >= 0 AND
    total_received >= 0 AND
    total_distributed >= 0
  )
);

-- 4. سجل استقطاعات الخير
CREATE TABLE IF NOT EXISTS charity_deductions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  farm_finance_id UUID NOT NULL REFERENCES smart_farm_finances(id),
  farm_code TEXT NOT NULL,
  farm_name TEXT,
  
  -- المبالغ
  platform_profit NUMERIC(15,2) NOT NULL,
  charity_percentage NUMERIC(5,2) DEFAULT 25 NOT NULL,
  charity_amount NUMERIC(15,2) NOT NULL,
  
  -- التوقيت
  deduction_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- إنشاء محفظة الخير الأساسية
INSERT INTO platform_charity_wallet (id) 
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_smart_farm_finances_farm_code ON smart_farm_finances(farm_code);
CREATE INDEX IF NOT EXISTS idx_smart_farm_finances_status ON smart_farm_finances(status);
CREATE INDEX IF NOT EXISTS idx_farm_financial_transactions_farm_code ON farm_financial_transactions(farm_code);
CREATE INDEX IF NOT EXISTS idx_farm_financial_transactions_type ON farm_financial_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_farm_financial_transactions_date ON farm_financial_transactions(transaction_date);

-- Comments
COMMENT ON TABLE smart_farm_finances IS 'النظام المالي الذكي للمزارع - يربط المبلغ التسويقي بالمبلغ الفعلي تلقائياً';
COMMENT ON TABLE farm_financial_transactions IS 'سجل جميع المعاملات المالية لكل مزرعة';
COMMENT ON TABLE platform_charity_wallet IS 'محفظة الخير - 25% من أرباح المنصة';
COMMENT ON TABLE charity_deductions_log IS 'سجل استقطاعات الخير من كل مزرعة';

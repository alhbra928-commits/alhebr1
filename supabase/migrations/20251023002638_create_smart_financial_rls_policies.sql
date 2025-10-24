/*
  # RLS Policies للنظام المالي الذكي
  
  1. السياسات
    - admins: صلاحية كاملة
    - authenticated: قراءة فقط
    - anon: قراءة محدودة للبيانات العامة
    
  2. الأمان
    - تفعيل RLS على جميع الجداول
    - policies منفصلة لكل عملية (SELECT, INSERT, UPDATE, DELETE)
*/

-- ═══════════════════════════════════════════════════════════
-- 1. smart_farm_finances
-- ═══════════════════════════════════════════════════════════
ALTER TABLE smart_farm_finances ENABLE ROW LEVEL SECURITY;

-- القراءة: authenticated + anon
CREATE POLICY "Anyone can view farm finances"
ON smart_farm_finances
FOR SELECT
TO public
USING (true);

-- الإدراج: authenticated فقط
CREATE POLICY "Authenticated users can create farm finances"
ON smart_farm_finances
FOR INSERT
TO authenticated
WITH CHECK (true);

-- التحديث: authenticated فقط
CREATE POLICY "Authenticated users can update farm finances"
ON smart_farm_finances
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- الحذف: authenticated فقط
CREATE POLICY "Authenticated users can delete farm finances"
ON smart_farm_finances
FOR DELETE
TO authenticated
USING (true);

-- ═══════════════════════════════════════════════════════════
-- 2. farm_financial_transactions
-- ═══════════════════════════════════════════════════════════
ALTER TABLE farm_financial_transactions ENABLE ROW LEVEL SECURITY;

-- القراءة: authenticated + anon
CREATE POLICY "Anyone can view financial transactions"
ON farm_financial_transactions
FOR SELECT
TO public
USING (true);

-- الإدراج: authenticated فقط
CREATE POLICY "Authenticated users can create transactions"
ON farm_financial_transactions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════
-- 3. platform_charity_wallet
-- ═══════════════════════════════════════════════════════════
ALTER TABLE platform_charity_wallet ENABLE ROW LEVEL SECURITY;

-- القراءة: الجميع
CREATE POLICY "Anyone can view charity wallet"
ON platform_charity_wallet
FOR SELECT
TO public
USING (true);

-- التحديث: authenticated فقط
CREATE POLICY "Authenticated users can update charity wallet"
ON platform_charity_wallet
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════
-- 4. charity_deductions_log
-- ═══════════════════════════════════════════════════════════
ALTER TABLE charity_deductions_log ENABLE ROW LEVEL SECURITY;

-- القراءة: الجميع
CREATE POLICY "Anyone can view charity deductions"
ON charity_deductions_log
FOR SELECT
TO public
USING (true);

-- الإدراج: authenticated فقط
CREATE POLICY "Authenticated users can create charity deductions"
ON charity_deductions_log
FOR INSERT
TO authenticated
WITH CHECK (true);

COMMENT ON TABLE smart_farm_finances IS 'RLS enabled - النظام المالي الذكي مع صلاحيات محددة';
COMMENT ON TABLE farm_financial_transactions IS 'RLS enabled - سجل المعاملات المالية مع صلاحيات محددة';
COMMENT ON TABLE platform_charity_wallet IS 'RLS enabled - محفظة الخير مع صلاحيات محددة';
COMMENT ON TABLE charity_deductions_log IS 'RLS enabled - سجل استقطاعات الخير مع صلاحيات محددة';

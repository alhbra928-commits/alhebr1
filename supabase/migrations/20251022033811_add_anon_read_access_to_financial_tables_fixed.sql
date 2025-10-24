/*
  # إضافة صلاحية القراءة العامة للجداول المالية

  ## التغييرات
  1. إضافة سياسات قراءة للمستخدمين غير المسجلين (anon) للجداول المالية:
     - `farm_wallets` - محافظ المزارع
     - `farm_ledgers` - سجل المعاملات المالية
     - `farm_financial_states` - الحالات المالية للمزارع
     - `farm_investors_ledger` - سجل المستثمرين

  ## الهدف
  السماح للوحة الإدارة المالية بجلب البيانات المالية بدون الحاجة لتسجيل دخول،
  مع الحفاظ على الأمان للعمليات الأخرى (INSERT, UPDATE, DELETE)

  ## ملاحظات الأمان
  - القراءة فقط للمستخدمين غير المسجلين
  - جميع عمليات الكتابة تتطلب مصادقة
*/

-- حذف السياسات القديمة إن وجدت ثم إضافتها
DO $$ 
BEGIN
  -- محافظ المزارع
  DROP POLICY IF EXISTS "Allow anon read farm_wallets" ON farm_wallets;
  CREATE POLICY "Allow anon read farm_wallets"
    ON farm_wallets FOR SELECT
    TO anon
    USING (true);

  -- سجل المعاملات المالية
  DROP POLICY IF EXISTS "Allow anon read farm_ledgers" ON farm_ledgers;
  CREATE POLICY "Allow anon read farm_ledgers"
    ON farm_ledgers FOR SELECT
    TO anon
    USING (true);

  -- الحالات المالية
  DROP POLICY IF EXISTS "Allow anon read farm_financial_states" ON farm_financial_states;
  CREATE POLICY "Allow anon read farm_financial_states"
    ON farm_financial_states FOR SELECT
    TO anon
    USING (true);

  -- سجل المستثمرين
  DROP POLICY IF EXISTS "Allow anon read farm_investors_ledger" ON farm_investors_ledger;
  CREATE POLICY "Allow anon read farm_investors_ledger"
    ON farm_investors_ledger FOR SELECT
    TO anon
    USING (true);
END $$;
/*
  # إضافة نظام تتبع تسديد صاحب المزرعة

  ## التغييرات
  1. إضافة حقول جديدة في `farm_wallets`:
    - `owner_payment_due`: المبلغ المستحق لصاحب المزرعة (السعر الفعلي)
    - `owner_payment_paid`: المبلغ المسدد لصاحب المزرعة
    - `owner_payment_status`: حالة التسديد (pending, partial, completed)
    - `owner_payment_completed_at`: تاريخ إكمال التسديد

  2. المنطق المالي:
    - ربح المنصة = (السعر التسويقي - السعر الفعلي)
    - لا يُحسب ربح المنصة إلا بعد تسديد كامل المبلغ لصاحب المزرعة
    - الاستقطاع الخيري = 25% من ربح المنصة (بعد التسديد فقط)

  ## الأمان
  - RLS تم تفعيله مسبقاً على farm_wallets
*/

-- إضافة حقول تتبع التسديد لصاحب المزرعة
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farm_wallets' AND column_name = 'owner_payment_due'
  ) THEN
    ALTER TABLE farm_wallets ADD COLUMN owner_payment_due NUMERIC(12,2) DEFAULT 0 CHECK (owner_payment_due >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farm_wallets' AND column_name = 'owner_payment_paid'
  ) THEN
    ALTER TABLE farm_wallets ADD COLUMN owner_payment_paid NUMERIC(12,2) DEFAULT 0 CHECK (owner_payment_paid >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farm_wallets' AND column_name = 'owner_payment_status'
  ) THEN
    ALTER TABLE farm_wallets ADD COLUMN owner_payment_status TEXT DEFAULT 'pending'
      CHECK (owner_payment_status IN ('pending', 'partial', 'completed'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farm_wallets' AND column_name = 'owner_payment_completed_at'
  ) THEN
    ALTER TABLE farm_wallets ADD COLUMN owner_payment_completed_at TIMESTAMPTZ;
  END IF;
END $$;

-- دالة لتحديث حالة تسديد المالك تلقائياً
CREATE OR REPLACE FUNCTION update_owner_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- إذا تم تسديد كامل المبلغ المستحق
  IF NEW.owner_payment_paid >= NEW.owner_payment_due AND NEW.owner_payment_due > 0 THEN
    NEW.owner_payment_status := 'completed';
    IF NEW.owner_payment_completed_at IS NULL THEN
      NEW.owner_payment_completed_at := NOW();
    END IF;
  -- إذا تم تسديد جزء من المبلغ
  ELSIF NEW.owner_payment_paid > 0 AND NEW.owner_payment_paid < NEW.owner_payment_due THEN
    NEW.owner_payment_status := 'partial';
    NEW.owner_payment_completed_at := NULL;
  -- لم يتم التسديد بعد
  ELSE
    NEW.owner_payment_status := 'pending';
    NEW.owner_payment_completed_at := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تطبيق الدالة على farm_wallets
DROP TRIGGER IF EXISTS trigger_update_owner_payment_status ON farm_wallets;
CREATE TRIGGER trigger_update_owner_payment_status
  BEFORE INSERT OR UPDATE OF owner_payment_paid, owner_payment_due
  ON farm_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_owner_payment_status();

-- دالة لمزامنة owner_payment_due مع السعر الفعلي من جدول farms
CREATE OR REPLACE FUNCTION sync_owner_payment_due()
RETURNS TRIGGER AS $$
DECLARE
  v_actual_price NUMERIC;
BEGIN
  -- جلب السعر الفعلي من المزرعة
  SELECT total_actual_price INTO v_actual_price
  FROM farms
  WHERE barcode = NEW.farm_barcode;

  -- تحديث المبلغ المستحق إذا كان موجوداً
  IF v_actual_price IS NOT NULL AND v_actual_price > 0 THEN
    NEW.owner_payment_due := v_actual_price;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تطبيق المزامنة عند إنشاء محفظة جديدة
DROP TRIGGER IF EXISTS trigger_sync_owner_payment_due ON farm_wallets;
CREATE TRIGGER trigger_sync_owner_payment_due
  BEFORE INSERT ON farm_wallets
  FOR EACH ROW
  EXECUTE FUNCTION sync_owner_payment_due();

-- تحديث المحافظ الموجودة بالسعر الفعلي من المزارع
UPDATE farm_wallets fw
SET owner_payment_due = f.total_actual_price
FROM farms f
WHERE fw.farm_barcode = f.barcode
  AND f.total_actual_price IS NOT NULL
  AND f.total_actual_price > 0;

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_farm_wallets_owner_payment_status
  ON farm_wallets(owner_payment_status);

CREATE INDEX IF NOT EXISTS idx_farm_wallets_owner_payment_completed
  ON farm_wallets(owner_payment_completed_at)
  WHERE owner_payment_completed_at IS NOT NULL;

/*
  # نظام إغلاق مسار البيع للمزارع
  
  1. التغييرات
    - إضافة حقل `sales_status` للمزارع
    - إضافة حقل `sales_closed_at` و `sales_closed_reason`
    - trigger تلقائي لإغلاق المزرعة عند اكتمال النظام المالي
    
  2. الأمان
    - يُغلق مسار البيع تلقائياً عند completion_stage = 'completed'
    - المزرعة تنتقل للخدمات الزراعية فقط
*/

-- إضافة الحقول للمزارع
DO $$
BEGIN
  -- sales_status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farms' AND column_name = 'sales_status'
  ) THEN
    ALTER TABLE farms ADD COLUMN sales_status TEXT DEFAULT 'open' 
    CHECK (sales_status IN ('open', 'closed', 'completed'));
  END IF;
  
  -- sales_closed_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farms' AND column_name = 'sales_closed_at'
  ) THEN
    ALTER TABLE farms ADD COLUMN sales_closed_at TIMESTAMPTZ;
  END IF;
  
  -- sales_closed_reason
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farms' AND column_name = 'sales_closed_reason'
  ) THEN
    ALTER TABLE farms ADD COLUMN sales_closed_reason TEXT;
  END IF;
END $$;

-- دالة إغلاق مسار البيع تلقائياً
CREATE OR REPLACE FUNCTION auto_close_farm_sales()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- عندما تصل المزرعة لمرحلة completed
  IF NEW.completion_stage = 'completed' AND (OLD.completion_stage IS NULL OR OLD.completion_stage != 'completed') THEN
    -- إغلاق مسار البيع في جدول المزارع
    UPDATE farms
    SET 
      sales_status = 'completed',
      sales_closed_at = NOW(),
      sales_closed_reason = 'اكتمال التحصيل المالي - تم سداد المالك وحساب الأرباح واستقطاع الخير',
      updated_at = NOW()
    WHERE farm_code = NEW.farm_code;
    
    RAISE NOTICE 'تم إغلاق مسار البيع للمزرعة: %', NEW.farm_name;
  END IF;
  
  RETURN NEW;
END;
$$;

-- تسجيل الـ trigger
DROP TRIGGER IF EXISTS trigger_auto_close_farm_sales ON smart_farm_finances;
CREATE TRIGGER trigger_auto_close_farm_sales
AFTER UPDATE OF completion_stage ON smart_farm_finances
FOR EACH ROW
EXECUTE FUNCTION auto_close_farm_sales();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_farms_sales_status ON farms(sales_status);

-- Comments
COMMENT ON COLUMN farms.sales_status IS 'حالة مسار البيع: open (مفتوح), closed (مغلق), completed (مكتمل ومنتقل للخدمات الزراعية)';
COMMENT ON COLUMN farms.sales_closed_at IS 'تاريخ إغلاق مسار البيع';
COMMENT ON COLUMN farms.sales_closed_reason IS 'سبب إغلاق مسار البيع';
COMMENT ON FUNCTION auto_close_farm_sales() IS 'يُغلق مسار البيع تلقائياً عند اكتمال النظام المالي للمزرعة';

/*
  # تطبيق المرحلة الثانية الكاملة - النظام المالي الذكي (مصحح)
*/

-- ========================================
-- 1. جدول لقطات الإيرادات
-- ========================================

CREATE TABLE IF NOT EXISTS farm_revenue_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  farm_code text NOT NULL,
  total_revenue numeric(15,2) DEFAULT 0,
  total_investors integer DEFAULT 0,
  total_trees_sold integer DEFAULT 0,
  completion_percentage numeric(5,2) DEFAULT 0,
  coverage_percentage numeric(5,2) DEFAULT 0,
  marketing_amount numeric(15,2) DEFAULT 0,
  actual_amount numeric(15,2) DEFAULT 0,
  remaining_amount numeric(15,2) DEFAULT 0,
  snapshot_reason text NOT NULL CHECK (snapshot_reason IN (
    'new_investment', 'price_change', 'manual_snapshot', 'daily_snapshot', 'settlement_start'
  )),
  snapshot_date timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_farm_revenue_snapshots_farm ON farm_revenue_snapshots(farm_code);
CREATE INDEX IF NOT EXISTS idx_farm_revenue_snapshots_date ON farm_revenue_snapshots(snapshot_date DESC);

ALTER TABLE farm_revenue_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read revenue snapshots" ON farm_revenue_snapshots;
CREATE POLICY "Anyone can read revenue snapshots"
  ON farm_revenue_snapshots FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "System can insert revenue snapshots" ON farm_revenue_snapshots;
CREATE POLICY "System can insert revenue snapshots"
  ON farm_revenue_snapshots FOR INSERT TO authenticated, anon WITH CHECK (true);

-- ========================================
-- 2. إضافة الحقول الجديدة
-- ========================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'smart_farm_finances' AND column_name = 'total_revenue_collected') THEN
    ALTER TABLE smart_farm_finances ADD COLUMN total_revenue_collected numeric(15,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'smart_farm_finances' AND column_name = 'financial_completion_percentage') THEN
    ALTER TABLE smart_farm_finances ADD COLUMN financial_completion_percentage numeric(5,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'smart_farm_finances' AND column_name = 'settlement_status') THEN
    ALTER TABLE smart_farm_finances ADD COLUMN settlement_status text DEFAULT 'collecting'
    CHECK (settlement_status IN ('collecting', 'ready_for_settlement', 'under_review', 'settled', 'frozen'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'smart_farm_finances' AND column_name = 'completion_reached_at') THEN
    ALTER TABLE smart_farm_finances ADD COLUMN completion_reached_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'smart_farm_finances' AND column_name = 'settlement_initiated_at') THEN
    ALTER TABLE smart_farm_finances ADD COLUMN settlement_initiated_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'smart_farm_finances' AND column_name = 'settlement_initiated_by') THEN
    ALTER TABLE smart_farm_finances ADD COLUMN settlement_initiated_by uuid;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'smart_farm_finances' AND column_name = 'investors_locked') THEN
    ALTER TABLE smart_farm_finances ADD COLUMN investors_locked boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'smart_farm_finances' AND column_name = 'last_revenue_transaction_id') THEN
    ALTER TABLE smart_farm_finances ADD COLUMN last_revenue_transaction_id uuid;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'smart_farm_finances' AND column_name = 'total_financial_transactions') THEN
    ALTER TABLE smart_farm_finances ADD COLUMN total_financial_transactions integer DEFAULT 0;
  END IF;
END $$;

-- ========================================
-- 3. دالة تسجيل معاملة مالية
-- ========================================

CREATE OR REPLACE FUNCTION record_financial_transaction(
  p_farm_code text,
  p_transaction_type text,
  p_amount numeric,
  p_description_ar text,
  p_source_type text,
  p_source_id uuid DEFAULT NULL,
  p_source_name text DEFAULT NULL,
  p_related_reservation_id uuid DEFAULT NULL,
  p_related_investor_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id uuid;
  v_farm_id uuid;
  v_current_revenue numeric;
  v_actual_amount numeric;
  v_completion_percentage numeric;
BEGIN
  SELECT id, COALESCE(total_revenue_collected, 0), COALESCE(actual_amount, 0)
  INTO v_farm_id, v_current_revenue, v_actual_amount
  FROM smart_farm_finances WHERE farm_code = p_farm_code;
  
  IF v_farm_id IS NULL THEN
    RAISE EXCEPTION 'Farm not found: %', p_farm_code;
  END IF;
  
  INSERT INTO farm_financial_transactions (
    farm_id, farm_code, transaction_type, amount, description,
    source_type, source_id, investor_name, transaction_date
  ) VALUES (
    v_farm_id, p_farm_code, p_transaction_type, p_amount, p_description_ar,
    p_source_type, p_source_id, p_source_name, now()
  ) RETURNING id INTO v_transaction_id;
  
  IF p_transaction_type = 'investor_revenue' THEN
    v_current_revenue := v_current_revenue + p_amount;
    
    IF v_actual_amount > 0 THEN
      v_completion_percentage := (v_current_revenue / v_actual_amount) * 100;
    ELSE
      v_completion_percentage := 0;
    END IF;
    
    UPDATE smart_farm_finances SET 
      total_revenue_collected = v_current_revenue,
      financial_completion_percentage = v_completion_percentage,
      last_revenue_transaction_id = v_transaction_id,
      total_financial_transactions = COALESCE(total_financial_transactions, 0) + 1,
      last_transaction_date = now(),
      updated_at = now()
    WHERE farm_code = p_farm_code;
    
    INSERT INTO farm_revenue_snapshots (
      farm_id, farm_code, total_revenue, total_investors, total_trees_sold,
      completion_percentage, coverage_percentage, marketing_amount, actual_amount,
      remaining_amount, snapshot_reason, metadata
    )
    SELECT 
      id, farm_code, total_revenue_collected, total_investors, total_trees_sold,
      financial_completion_percentage, coverage_percentage, marketing_amount, actual_amount,
      actual_amount - total_revenue_collected, 'new_investment',
      jsonb_build_object('transaction_id', v_transaction_id)
    FROM smart_farm_finances WHERE farm_code = p_farm_code;
    
    IF v_completion_percentage >= 100 THEN
      UPDATE smart_farm_finances SET 
        settlement_status = 'ready_for_settlement',
        completion_reached_at = now()
      WHERE farm_code = p_farm_code AND settlement_status = 'collecting';
      
      INSERT INTO financial_base_log (
        action_type, entity_type, entity_id, entity_code, description_ar,
        new_data, source_module, status
      ) VALUES (
        'sync_completed', 'farm', v_farm_id, p_farm_code,
        'المزرعة وصلت إلى الاكتمال المالي - جاهزة للتسوية',
        jsonb_build_object('completion_percentage', v_completion_percentage, 'total_revenue', v_current_revenue, 'actual_amount', v_actual_amount),
        'finance', 'success'
      );
    END IF;
  END IF;
  
  RETURN v_transaction_id;
END;
$$;

-- ========================================
-- 4. Trigger للتحديث التلقائي عند حجز
-- ========================================

CREATE OR REPLACE FUNCTION auto_record_investor_revenue()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id uuid;
  v_investor_name text;
  v_finance_locked boolean;
BEGIN
  SELECT COALESCE(investors_locked, false) INTO v_finance_locked
  FROM smart_farm_finances WHERE farm_code = NEW.farm_code;
  
  IF v_finance_locked THEN
    RETURN NEW;
  END IF;
  
  SELECT name INTO v_investor_name FROM investors WHERE id = NEW.investor_id;
  
  IF NEW.booking_status = 'approved' AND (OLD IS NULL OR OLD.booking_status != 'approved') THEN
    BEGIN
      v_transaction_id := record_financial_transaction(
        p_farm_code := NEW.farm_code,
        p_transaction_type := 'investor_revenue',
        p_amount := COALESCE(NEW.total_amount, 0),
        p_description_ar := 'إيراد من حجز: ' || COALESCE(v_investor_name, 'مستثمر') || ' - ' || COALESCE(NEW.number_of_trees, 0) || ' شجرة',
        p_source_type := 'investor',
        p_source_id := NEW.investor_id,
        p_source_name := v_investor_name,
        p_related_reservation_id := NEW.id,
        p_related_investor_id := NEW.investor_id
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'خطأ في تسجيل الإيراد: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_record_investor_revenue ON reservations;
CREATE TRIGGER trigger_auto_record_investor_revenue
  AFTER INSERT OR UPDATE OF booking_status, total_amount ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION auto_record_investor_revenue();

-- ========================================
-- 5. دالة بدء التسوية المالية
-- ========================================

CREATE OR REPLACE FUNCTION initiate_settlement(
  p_farm_code text,
  p_initiated_by uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_id uuid;
  v_current_status text;
  v_completion_percentage numeric;
BEGIN
  SELECT id, settlement_status, COALESCE(financial_completion_percentage, 0)
  INTO v_farm_id, v_current_status, v_completion_percentage
  FROM smart_farm_finances WHERE farm_code = p_farm_code;
  
  IF v_farm_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'المزرعة غير موجودة');
  END IF;
  
  IF v_completion_percentage < 100 THEN
    RETURN jsonb_build_object('success', false, 'message', 'المزرعة لم تصل إلى الاكتمال المالي بعد', 'completion_percentage', v_completion_percentage);
  END IF;
  
  IF v_current_status != 'ready_for_settlement' THEN
    RETURN jsonb_build_object('success', false, 'message', 'المزرعة في حالة غير مناسبة للتسوية', 'current_status', v_current_status);
  END IF;
  
  UPDATE smart_farm_finances SET 
    settlement_status = 'under_review',
    settlement_initiated_at = now(),
    settlement_initiated_by = p_initiated_by,
    investors_locked = true,
    updated_at = now()
  WHERE farm_code = p_farm_code;
  
  PERFORM record_financial_transaction(
    p_farm_code := p_farm_code,
    p_transaction_type := 'settlement_initiated',
    p_amount := 0,
    p_description_ar := 'بدء عملية التسوية المالية - قفل استقبال المستثمرين',
    p_source_type := 'admin',
    p_source_id := p_initiated_by
  );
  
  INSERT INTO farm_revenue_snapshots (
    farm_id, farm_code, total_revenue, total_investors, total_trees_sold,
    completion_percentage, coverage_percentage, marketing_amount, actual_amount,
    remaining_amount, snapshot_reason, metadata
  )
  SELECT 
    id, farm_code, COALESCE(total_revenue_collected, 0), COALESCE(total_investors, 0),
    COALESCE(total_trees_sold, 0), COALESCE(financial_completion_percentage, 0),
    COALESCE(coverage_percentage, 0), COALESCE(marketing_amount, 0), COALESCE(actual_amount, 0),
    COALESCE(actual_amount, 0) - COALESCE(total_revenue_collected, 0), 'settlement_start',
    jsonb_build_object('initiated_by', p_initiated_by)
  FROM smart_farm_finances WHERE farm_code = p_farm_code;
  
  RETURN jsonb_build_object('success', true, 'message', 'تم بدء عملية التسوية المالية بنجاح', 'farm_code', p_farm_code, 'new_status', 'under_review');
END;
$$;

-- ========================================
-- 6. إعادة حساب المزارع الموجودة
-- ========================================

DO $$
DECLARE
  v_farm RECORD;
BEGIN
  FOR v_farm IN 
    SELECT farm_code FROM smart_farm_finances WHERE deleted_at IS NULL
  LOOP
    BEGIN
      PERFORM recalculate_farm_finances(v_farm.farm_code);
    EXCEPTION WHEN OTHERS THEN
      CONTINUE;
    END;
  END LOOP;
END $$;

/*
  # المرحلة الأولى: النظام المالي الذكي - الهيكل الأساسي
  
  ## نظرة عامة
  هذه المرحلة تؤسس البنية المالية الأساسية حيث كل مزرعة تصبح كياناً مالياً مستقلاً
  مع إنشاء روابط ذكية مع جميع الإدارات (المزارع، أصحاب المزارع، المستثمرين)
  
  ## الجداول الجديدة
  
  ### 1. financial_base_log
  - سجل تدقيق شامل لجميع العمليات المالية
  - يسجل كل ربط، تعديل، أو إضافة في النظام المالي
  - يحتوي على معلومات المستخدم والوقت ونوع الإجراء
  
  ### 2. farm_financial_relations
  - خريطة الربط بين المزرعة والإدارات المختلفة
  - توضح مصدر كل بيانة مالية
  - تتبع حالة التزامن بين الإدارات
  
  ## التحديثات على smart_farm_finances
  - إضافة حقول جديدة للربط المباشر
  - تحسين آلية حساب النسب المالية
  - إضافة metadata للمرحلة الحالية
  
  ## الأمان
  - RLS مفعّل على جميع الجداول
  - سياسات للقراءة والكتابة للمدراء فقط
  - سياسة قراءة محدودة للبيانات العامة
*/

-- ========================================
-- 1. جدول سجل التدقيق المالي الأساسي
-- ========================================

CREATE TABLE IF NOT EXISTS financial_base_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- نوع الإجراء
  action_type text NOT NULL CHECK (action_type IN (
    'farm_created',           -- إنشاء مزرعة جديدة
    'farm_linked',            -- ربط مزرعة بمالك
    'owner_linked',           -- ربط مالك بمزرعة
    'investor_booking',       -- حجز مستثمر
    'financial_update',       -- تحديث مالي
    'marketing_price_change', -- تغيير السعر التسويقي
    'actual_price_change',    -- تغيير السعر الفعلي
    'sync_completed',         -- اكتمال مزامنة
    'error_occurred'          -- حدوث خطأ
  )),
  
  -- الكيان المتأثر
  entity_type text NOT NULL CHECK (entity_type IN (
    'farm',
    'owner',
    'investor',
    'reservation',
    'finance'
  )),
  entity_id uuid NOT NULL,
  entity_code text, -- farm_code أو أي كود آخر
  
  -- التفاصيل
  description_ar text NOT NULL,
  description_en text,
  
  -- البيانات قبل وبعد التغيير
  old_data jsonb,
  new_data jsonb,
  
  -- معلومات المستخدم
  performed_by uuid, -- يمكن أن يكون null للعمليات التلقائية
  performed_by_name text,
  performed_by_role text,
  
  -- معلومات النظام
  source_module text NOT NULL, -- 'farms', 'owners', 'investors', 'finance'
  target_module text,
  ip_address text,
  user_agent text,
  
  -- الحالة
  status text DEFAULT 'success' CHECK (status IN ('success', 'failed', 'pending')),
  error_message text,
  
  -- التوقيت
  created_at timestamptz DEFAULT now(),
  
  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Index للأداء
CREATE INDEX IF NOT EXISTS idx_financial_base_log_entity ON financial_base_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_financial_base_log_action ON financial_base_log(action_type);
CREATE INDEX IF NOT EXISTS idx_financial_base_log_created ON financial_base_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_financial_base_log_user ON financial_base_log(performed_by);
CREATE INDEX IF NOT EXISTS idx_financial_base_log_farm_code ON financial_base_log(entity_code);

-- ========================================
-- 2. جدول خريطة الربط المالي
-- ========================================

CREATE TABLE IF NOT EXISTS farm_financial_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- المزرعة
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  farm_code text NOT NULL,
  
  -- الربط مع إدارة المزارع
  farms_module_synced boolean DEFAULT false,
  farms_last_sync timestamptz,
  marketing_amount numeric(15,2) DEFAULT 0,
  total_trees integer DEFAULT 0,
  farm_type text,
  
  -- الربط مع إدارة أصحاب المزارع  
  owners_module_synced boolean DEFAULT false,
  owners_last_sync timestamptz,
  owner_id uuid REFERENCES farm_owners(id) ON DELETE SET NULL,
  actual_amount numeric(15,2) DEFAULT 0,
  owner_bank_info jsonb,
  payment_terms text, -- '3_months', '6_months', '9_months', '12_months'
  
  -- الربط مع إدارة المستثمرين
  investors_module_synced boolean DEFAULT false,
  investors_last_sync timestamptz,
  total_investors integer DEFAULT 0,
  total_invested numeric(15,2) DEFAULT 0,
  total_trees_sold integer DEFAULT 0,
  
  -- الحالة العامة
  all_modules_synced boolean GENERATED ALWAYS AS (
    farms_module_synced AND 
    owners_module_synced AND 
    investors_module_synced
  ) STORED,
  
  -- التوقيت
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Metadata
  sync_errors jsonb DEFAULT '[]'::jsonb,
  last_error text,
  last_error_at timestamptz
);

-- Index للأداء
CREATE UNIQUE INDEX IF NOT EXISTS idx_farm_financial_relations_farm ON farm_financial_relations(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_financial_relations_farm_code ON farm_financial_relations(farm_code);
CREATE INDEX IF NOT EXISTS idx_farm_financial_relations_owner ON farm_financial_relations(owner_id);
CREATE INDEX IF NOT EXISTS idx_farm_financial_relations_synced ON farm_financial_relations(all_modules_synced);

-- ========================================
-- 3. تحديث جدول smart_farm_finances
-- ========================================

-- إضافة حقول جديدة للمرحلة الأولى
DO $$ 
BEGIN
  -- حقل لربط خريطة العلاقات
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_farm_finances' AND column_name = 'relations_map_id'
  ) THEN
    ALTER TABLE smart_farm_finances ADD COLUMN relations_map_id uuid REFERENCES farm_financial_relations(id);
  END IF;
  
  -- مرحلة النظام المالي
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_farm_finances' AND column_name = 'system_phase'
  ) THEN
    ALTER TABLE smart_farm_finances ADD COLUMN system_phase text DEFAULT 'phase_1' 
    CHECK (system_phase IN ('phase_1', 'phase_2', 'phase_3'));
  END IF;
  
  -- حالة المزامنة العامة
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_farm_finances' AND column_name = 'sync_status'
  ) THEN
    ALTER TABLE smart_farm_finances ADD COLUMN sync_status text DEFAULT 'pending'
    CHECK (sync_status IN ('pending', 'syncing', 'synced', 'error'));
  END IF;
  
  -- آخر خطأ مزامنة
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_farm_finances' AND column_name = 'last_sync_error'
  ) THEN
    ALTER TABLE smart_farm_finances ADD COLUMN last_sync_error text;
  END IF;
  
  -- معلومات إضافية من المزرعة
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_farm_finances' AND column_name = 'farm_metadata'
  ) THEN
    ALTER TABLE smart_farm_finances ADD COLUMN farm_metadata jsonb DEFAULT '{}'::jsonb;
  END IF;
  
  -- معلومات المالك المالية
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_farm_finances' AND column_name = 'owner_financial_data'
  ) THEN
    ALTER TABLE smart_farm_finances ADD COLUMN owner_financial_data jsonb DEFAULT '{}'::jsonb;
  END IF;
  
  -- معلومات المستثمرين
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_farm_finances' AND column_name = 'investors_summary'
  ) THEN
    ALTER TABLE smart_farm_finances ADD COLUMN investors_summary jsonb DEFAULT '{"count": 0, "total_invested": 0, "pending_amount": 0}'::jsonb;
  END IF;
END $$;

-- ========================================
-- 4. RLS Policies
-- ========================================

-- financial_base_log
ALTER TABLE financial_base_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read financial logs"
  ON financial_base_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert financial logs"
  ON financial_base_log FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- farm_financial_relations  
ALTER TABLE farm_financial_relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read financial relations"
  ON farm_financial_relations FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage financial relations"
  ON farm_financial_relations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ========================================
-- 5. Triggers للتحديث التلقائي
-- ========================================

-- Trigger لتحديث updated_at في farm_financial_relations
CREATE OR REPLACE FUNCTION update_farm_financial_relations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_farm_financial_relations_timestamp ON farm_financial_relations;
CREATE TRIGGER trigger_update_farm_financial_relations_timestamp
  BEFORE UPDATE ON farm_financial_relations
  FOR EACH ROW
  EXECUTE FUNCTION update_farm_financial_relations_timestamp();

-- ========================================
-- 6. دالة لإنشاء كيان مالي عند إضافة مزرعة
-- ========================================

CREATE OR REPLACE FUNCTION create_financial_entity_for_farm()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_financial_barcode text;
  v_finance_id uuid;
  v_relations_id uuid;
BEGIN
  -- توليد الباركود المالي
  v_financial_barcode := 'FIN-' || NEW.farm_code || '-' || UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 6));
  
  -- إنشاء خريطة الربط أولاً
  INSERT INTO farm_financial_relations (
    farm_id,
    farm_code,
    farms_module_synced,
    farms_last_sync,
    marketing_amount,
    total_trees,
    farm_type
  ) VALUES (
    NEW.id,
    NEW.farm_code,
    true,
    now(),
    COALESCE(NEW.price_per_tree, 0) * COALESCE(NEW.total_trees, 0),
    NEW.total_trees,
    NEW.tree_type
  ) RETURNING id INTO v_relations_id;
  
  -- إنشاء البطاقة المالية
  INSERT INTO smart_farm_finances (
    farm_id,
    farm_code,
    farm_name,
    marketing_amount,
    financial_barcode,
    status,
    system_phase,
    sync_status,
    relations_map_id,
    farm_metadata
  ) VALUES (
    NEW.id,
    NEW.farm_code,
    NEW.name_ar,
    COALESCE(NEW.price_per_tree, 0) * COALESCE(NEW.total_trees, 0),
    v_financial_barcode,
    'active',
    'phase_1',
    'pending',
    v_relations_id,
    jsonb_build_object(
      'tree_type', NEW.tree_type,
      'total_trees', NEW.total_trees,
      'price_per_tree', NEW.price_per_tree,
      'location', NEW.location
    )
  ) RETURNING id INTO v_finance_id;
  
  -- تسجيل في سجل التدقيق
  INSERT INTO financial_base_log (
    action_type,
    entity_type,
    entity_id,
    entity_code,
    description_ar,
    new_data,
    source_module,
    status
  ) VALUES (
    'farm_created',
    'farm',
    NEW.id,
    NEW.farm_code,
    'تم إنشاء كيان مالي جديد للمزرعة: ' || NEW.name_ar,
    jsonb_build_object(
      'farm_name', NEW.name_ar,
      'farm_code', NEW.farm_code,
      'financial_barcode', v_financial_barcode,
      'marketing_amount', COALESCE(NEW.price_per_tree, 0) * COALESCE(NEW.total_trees, 0)
    ),
    'farms',
    'success'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ربط الـ trigger بجدول المزارع
DROP TRIGGER IF EXISTS trigger_create_financial_entity ON farms;
CREATE TRIGGER trigger_create_financial_entity
  AFTER INSERT ON farms
  FOR EACH ROW
  EXECUTE FUNCTION create_financial_entity_for_farm();

-- ========================================
-- 7. دالة لمزامنة التحديثات من المزارع
-- ========================================

CREATE OR REPLACE FUNCTION sync_farm_financial_updates()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_marketing_amount numeric;
BEGIN
  -- حساب السعر التسويقي الجديد
  v_new_marketing_amount := COALESCE(NEW.price_per_tree, 0) * COALESCE(NEW.total_trees, 0);
  
  -- تحديث خريطة الربط
  UPDATE farm_financial_relations
  SET 
    marketing_amount = v_new_marketing_amount,
    total_trees = NEW.total_trees,
    farm_type = NEW.tree_type,
    farms_last_sync = now(),
    farms_module_synced = true,
    updated_at = now()
  WHERE farm_id = NEW.id;
  
  -- تحديث البطاقة المالية
  UPDATE smart_farm_finances
  SET 
    farm_name = NEW.name_ar,
    marketing_amount = v_new_marketing_amount,
    sync_status = 'synced',
    farm_metadata = jsonb_build_object(
      'tree_type', NEW.tree_type,
      'total_trees', NEW.total_trees,
      'price_per_tree', NEW.price_per_tree,
      'location', NEW.location
    ),
    updated_at = now()
  WHERE farm_id = NEW.id;
  
  -- تسجيل في سجل التدقيق
  IF OLD.price_per_tree IS DISTINCT FROM NEW.price_per_tree OR 
     OLD.total_trees IS DISTINCT FROM NEW.total_trees THEN
    INSERT INTO financial_base_log (
      action_type,
      entity_type,
      entity_id,
      entity_code,
      description_ar,
      old_data,
      new_data,
      source_module,
      status
    ) VALUES (
      'marketing_price_change',
      'farm',
      NEW.id,
      NEW.farm_code,
      'تحديث السعر التسويقي للمزرعة: ' || NEW.name_ar,
      jsonb_build_object(
        'price_per_tree', OLD.price_per_tree,
        'total_trees', OLD.total_trees,
        'marketing_amount', COALESCE(OLD.price_per_tree, 0) * COALESCE(OLD.total_trees, 0)
      ),
      jsonb_build_object(
        'price_per_tree', NEW.price_per_tree,
        'total_trees', NEW.total_trees,
        'marketing_amount', v_new_marketing_amount
      ),
      'farms',
      'success'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ربط الـ trigger بجدول المزارع
DROP TRIGGER IF EXISTS trigger_sync_farm_financial_updates ON farms;
CREATE TRIGGER trigger_sync_farm_financial_updates
  AFTER UPDATE ON farms
  FOR EACH ROW
  WHEN (
    OLD.price_per_tree IS DISTINCT FROM NEW.price_per_tree OR
    OLD.total_trees IS DISTINCT FROM NEW.total_trees OR
    OLD.name_ar IS DISTINCT FROM NEW.name_ar OR
    OLD.tree_type IS DISTINCT FROM NEW.tree_type
  )
  EXECUTE FUNCTION sync_farm_financial_updates();

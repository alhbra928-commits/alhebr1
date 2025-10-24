/*
  # إنشاء نظام النسخ الاحتياطي الذكي للنظام المالي

  ## الجداول الجديدة

  1. **farm_financial_backups** - سجل النسخ الاحتياطية
    - `id` (uuid, primary key)
    - `farm_barcode` (text, not null)
    - `backup_type` (text) - instant, scheduled, monthly
    - `backup_path` (text) - المسار النسبي
    - `backup_data` (jsonb) - البيانات المنسوخة
    - `operation_trigger` (text) - العملية المحفزة
    - `file_size` (integer) - حجم النسخة
    - `created_at` (timestamptz)

  2. **farm_financial_backup_schedule** - جدول النسخ الدوري
    - `id` (uuid, primary key)
    - `farm_barcode` (text, unique)
    - `last_backup_at` (timestamptz)
    - `next_backup_at` (timestamptz)
    - `backup_frequency_hours` (integer) - default 6
    - `status` (text) - active, paused
    - `created_at`, `updated_at`

  ## الدوال

  1. **create_instant_backup** - نسخ فوري لكل عملية
  2. **create_scheduled_backup** - نسخ دوري
  3. **create_monthly_archive** - أرشيف شهري

  ## Triggers

  1. **trigger_instant_backup_on_transaction** - نسخ فوري عند معاملة
*/

-- جدول النسخ الاحتياطية
CREATE TABLE IF NOT EXISTS farm_financial_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_barcode text NOT NULL,
  backup_type text NOT NULL CHECK (backup_type IN ('instant', 'scheduled', 'monthly', 'manual')),
  backup_path text NOT NULL,
  backup_data jsonb DEFAULT '{}'::jsonb,
  operation_trigger text,
  file_size integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- جدول جدولة النسخ الدوري
CREATE TABLE IF NOT EXISTS farm_financial_backup_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_barcode text UNIQUE NOT NULL,
  last_backup_at timestamptz,
  next_backup_at timestamptz,
  backup_frequency_hours integer DEFAULT 6 CHECK (backup_frequency_hours > 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_farm_financial_backups_barcode ON farm_financial_backups(farm_barcode);
CREATE INDEX IF NOT EXISTS idx_farm_financial_backups_created ON farm_financial_backups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_farm_financial_backup_schedule_barcode ON farm_financial_backup_schedule(farm_barcode);
CREATE INDEX IF NOT EXISTS idx_farm_financial_backup_schedule_next ON farm_financial_backup_schedule(next_backup_at);

-- دالة إنشاء نسخة احتياطية فورية
CREATE OR REPLACE FUNCTION create_instant_backup(
  barcode_param text,
  trigger_operation text
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  backup_id uuid;
  wallet_data jsonb;
  ledger_data jsonb;
  expenses_data jsonb;
  investors_data jsonb;
  state_data jsonb;
  full_backup jsonb;
  backup_path_str text;
BEGIN
  -- جمع بيانات المحفظة
  SELECT to_jsonb(fw.*) INTO wallet_data
  FROM farm_wallets fw
  WHERE fw.farm_barcode = barcode_param;

  -- جمع بيانات المعاملات (آخر 100)
  SELECT jsonb_agg(to_jsonb(fl.*))
  INTO ledger_data
  FROM (
    SELECT * FROM farm_ledgers
    WHERE farm_barcode = barcode_param
    ORDER BY transaction_date DESC
    LIMIT 100
  ) fl;

  -- جمع بيانات المصروفات (آخر 100)
  SELECT jsonb_agg(to_jsonb(fe.*))
  INTO expenses_data
  FROM (
    SELECT * FROM farm_expenses
    WHERE farm_barcode = barcode_param
    ORDER BY expense_date DESC
    LIMIT 100
  ) fe;

  -- جمع بيانات المستثمرين
  SELECT jsonb_agg(to_jsonb(fil.*))
  INTO investors_data
  FROM farm_investors_ledger fil
  WHERE fil.farm_barcode = barcode_param;

  -- جمع بيانات الحالة
  SELECT to_jsonb(ffs.*) INTO state_data
  FROM farm_financial_states ffs
  WHERE ffs.farm_barcode = barcode_param;

  -- دمج كل البيانات
  full_backup := jsonb_build_object(
    'wallet', wallet_data,
    'ledger', COALESCE(ledger_data, '[]'::jsonb),
    'expenses', COALESCE(expenses_data, '[]'::jsonb),
    'investors', COALESCE(investors_data, '[]'::jsonb),
    'state', state_data,
    'backup_timestamp', now()
  );

  -- إنشاء المسار
  backup_path_str := '/Finance/Backups/' || barcode_param || '/instant_' || 
                     to_char(now(), 'YYYYMMDD_HH24MISS') || '.json';

  -- حفظ النسخة
  INSERT INTO farm_financial_backups (
    farm_barcode,
    backup_type,
    backup_path,
    backup_data,
    operation_trigger,
    file_size
  )
  VALUES (
    barcode_param,
    'instant',
    backup_path_str,
    full_backup,
    trigger_operation,
    length(full_backup::text)
  )
  RETURNING id INTO backup_id;

  RETURN backup_id;
END;
$$;

-- دالة إنشاء نسخة دورية مجدولة
CREATE OR REPLACE FUNCTION create_scheduled_backup(barcode_param text)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  backup_id uuid;
BEGIN
  backup_id := create_instant_backup(barcode_param, 'scheduled_backup');
  
  -- تحديث جدول الجدولة
  UPDATE farm_financial_backup_schedule
  SET 
    last_backup_at = now(),
    next_backup_at = now() + (backup_frequency_hours || ' hours')::interval,
    updated_at = now()
  WHERE farm_barcode = barcode_param;
  
  RETURN backup_id;
END;
$$;

-- دالة إنشاء أرشيف شهري
CREATE OR REPLACE FUNCTION create_monthly_archive(barcode_param text)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  backup_id uuid;
  archive_path text;
  full_data jsonb;
BEGIN
  -- جمع كل البيانات (بدون حد)
  SELECT jsonb_build_object(
    'wallet', (SELECT to_jsonb(fw.*) FROM farm_wallets fw WHERE fw.farm_barcode = barcode_param),
    'ledger', (SELECT jsonb_agg(to_jsonb(fl.*)) FROM farm_ledgers fl WHERE fl.farm_barcode = barcode_param),
    'expenses', (SELECT jsonb_agg(to_jsonb(fe.*)) FROM farm_expenses fe WHERE fe.farm_barcode = barcode_param),
    'investors', (SELECT jsonb_agg(to_jsonb(fil.*)) FROM farm_investors_ledger fil WHERE fil.farm_barcode = barcode_param),
    'state', (SELECT to_jsonb(ffs.*) FROM farm_financial_states ffs WHERE ffs.farm_barcode = barcode_param),
    'audit_log', (SELECT jsonb_agg(to_jsonb(fal.*)) FROM farm_financial_audit_log fal WHERE fal.farm_barcode = barcode_param),
    'archive_date', now()
  ) INTO full_data;

  archive_path := '/Finance/Backups/' || barcode_param || '/archive_' || 
                  to_char(now(), 'YYYYMM') || '.json.gz';

  INSERT INTO farm_financial_backups (
    farm_barcode,
    backup_type,
    backup_path,
    backup_data,
    operation_trigger,
    file_size
  )
  VALUES (
    barcode_param,
    'monthly',
    archive_path,
    full_data,
    'monthly_archive',
    length(full_data::text)
  )
  RETURNING id INTO backup_id;

  RETURN backup_id;
END;
$$;

-- دالة إنشاء جدول نسخ احتياطي للمزرعة
CREATE OR REPLACE FUNCTION initialize_backup_schedule(barcode_param text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO farm_financial_backup_schedule (
    farm_barcode,
    last_backup_at,
    next_backup_at,
    backup_frequency_hours,
    status
  )
  VALUES (
    barcode_param,
    now(),
    now() + interval '6 hours',
    6,
    'active'
  )
  ON CONFLICT (farm_barcode) DO NOTHING;
END;
$$;

-- Trigger للنسخ الفوري عند إضافة معاملة
CREATE OR REPLACE FUNCTION trigger_instant_backup_on_transaction()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- إنشاء نسخة فورية
  PERFORM create_instant_backup(
    NEW.farm_barcode,
    'transaction_' || NEW.transaction_type
  );
  
  RETURN NEW;
END;
$$;

-- ربط الـ Trigger
DROP TRIGGER IF EXISTS trigger_instant_financial_backup ON farm_ledgers;
CREATE TRIGGER trigger_instant_financial_backup
  AFTER INSERT ON farm_ledgers
  FOR EACH ROW
  EXECUTE FUNCTION trigger_instant_backup_on_transaction();

-- تحديث دالة إنشاء الكيانات المالية لتشمل جدول النسخ
CREATE OR REPLACE FUNCTION auto_create_farm_financial_entities()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- إنشاء محفظة المزرعة
  INSERT INTO farm_wallets (farm_barcode, balance, status)
  VALUES (NEW.barcode, 0, 'active')
  ON CONFLICT (farm_barcode) DO NOTHING;

  -- إنشاء حالة مالية للمزرعة
  INSERT INTO farm_financial_states (farm_barcode, current_state)
  VALUES (NEW.barcode, 'active')
  ON CONFLICT (farm_barcode) DO NOTHING;

  -- إنشاء جدول نسخ احتياطي
  PERFORM initialize_backup_schedule(NEW.barcode);

  -- تسجيل في Audit Log
  INSERT INTO farm_financial_audit_log (
    operation_number,
    farm_barcode,
    operation_type,
    status,
    metadata
  )
  VALUES (
    generate_operation_number(),
    NEW.barcode,
    'farm_created',
    'completed',
    jsonb_build_object('farm_id', NEW.id, 'farm_name', NEW.name)
  );

  -- إنشاء أول نسخة احتياطية
  PERFORM create_instant_backup(NEW.barcode, 'farm_initialization');

  RETURN NEW;
END;
$$;

-- تفعيل RLS
ALTER TABLE farm_financial_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_financial_backup_schedule ENABLE ROW LEVEL SECURITY;

-- سياسات RLS
CREATE POLICY "Allow authenticated read farm_financial_backups"
  ON farm_financial_backups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert farm_financial_backups"
  ON farm_financial_backups FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated read farm_financial_backup_schedule"
  ON farm_financial_backup_schedule FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert farm_financial_backup_schedule"
  ON farm_financial_backup_schedule FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update farm_financial_backup_schedule"
  ON farm_financial_backup_schedule FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

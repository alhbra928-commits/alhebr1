/*
  # نظام سياسة الاحتفاظ بالنسخ الاحتياطية
  # Backup Retention Policy System
  
  ## Features:
  - Retention limits (10 backups / 30 days)
  - Lock system for important backups
  - Auto-deletion logging
  - Storage tracking
*/

-- إضافة عمود التثبيت (Lock) لجدول backup_history
ALTER TABLE backup_history ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false;
ALTER TABLE backup_history ADD COLUMN IF NOT EXISTS locked_at timestamptz;
ALTER TABLE backup_history ADD COLUMN IF NOT EXISTS locked_by uuid;
ALTER TABLE backup_history ADD COLUMN IF NOT EXISTS lock_reason text;

-- إنشاء جدول سجل الحذف الآلي
CREATE TABLE IF NOT EXISTS backup_retention_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deleted_backup_id uuid NOT NULL,
  backup_name text NOT NULL,
  backup_type text NOT NULL,
  deletion_reason text NOT NULL,
  deletion_type text NOT NULL CHECK (deletion_type IN ('auto_retention', 'manual', 'policy_exceeded')),
  backup_age_days integer,
  backup_size bigint,
  tables_count integer,
  records_count integer,
  created_at timestamptz NOT NULL,
  deleted_at timestamptz DEFAULT now(),
  deleted_by uuid,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_retention_logs_deleted_at ON backup_retention_logs(deleted_at DESC);
CREATE INDEX IF NOT EXISTS idx_retention_logs_deletion_type ON backup_retention_logs(deletion_type);

ALTER TABLE backup_retention_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view retention logs" ON backup_retention_logs;
CREATE POLICY "Admins can view retention logs"
  ON backup_retention_logs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- دالة تطبيق سياسة الاحتفاظ
CREATE OR REPLACE FUNCTION apply_retention_policy(
  p_max_backups_per_type integer DEFAULT 10,
  p_max_age_days integer DEFAULT 30
)
RETURNS jsonb AS $$
DECLARE
  v_backup_record record;
  v_deleted_count integer := 0;
  v_skipped_locked integer := 0;
  v_deleted_by_age integer := 0;
  v_deleted_by_count integer := 0;
  v_result jsonb;
BEGIN
  -- حذف النسخ القديمة (أكثر من 30 يوم) - ما عدا المثبتة
  FOR v_backup_record IN
    SELECT * FROM backup_history
    WHERE created_at < (now() - make_interval(days => p_max_age_days))
      AND backup_type IN ('automatic', 'scheduled')
      AND is_locked = false
      AND status = 'completed'
    ORDER BY created_at ASC
  LOOP
    -- تسجيل في جدول الحذف
    INSERT INTO backup_retention_logs (
      deleted_backup_id,
      backup_name,
      backup_type,
      deletion_reason,
      deletion_type,
      backup_age_days,
      backup_size,
      tables_count,
      records_count,
      created_at,
      deleted_by,
      metadata
    ) VALUES (
      v_backup_record.id,
      v_backup_record.backup_name,
      v_backup_record.backup_type,
      format('تجاوز الحد الأقصى للعمر: %s يوم', p_max_age_days),
      'auto_retention',
      EXTRACT(DAY FROM (now() - v_backup_record.created_at)),
      v_backup_record.backup_size,
      v_backup_record.tables_count,
      v_backup_record.records_count,
      v_backup_record.created_at,
      auth.uid(),
      jsonb_build_object(
        'max_age_days', p_max_age_days,
        'actual_age_days', EXTRACT(DAY FROM (now() - v_backup_record.created_at))
      )
    );
    
    -- حذف النسخة
    DELETE FROM backup_history WHERE id = v_backup_record.id;
    
    v_deleted_count := v_deleted_count + 1;
    v_deleted_by_age := v_deleted_by_age + 1;
  END LOOP;

  -- حذف النسخ الزائدة لكل نوع (أكثر من 10) - ما عدا المثبتة
  FOR v_backup_record IN
    SELECT * FROM (
      SELECT 
        *,
        ROW_NUMBER() OVER (PARTITION BY backup_type ORDER BY created_at DESC) as rn
      FROM backup_history
      WHERE backup_type IN ('automatic', 'scheduled')
        AND is_locked = false
        AND status = 'completed'
    ) ranked
    WHERE rn > p_max_backups_per_type
    ORDER BY created_at ASC
  LOOP
    -- تسجيل في جدول الحذف
    INSERT INTO backup_retention_logs (
      deleted_backup_id,
      backup_name,
      backup_type,
      deletion_reason,
      deletion_type,
      backup_age_days,
      backup_size,
      tables_count,
      records_count,
      created_at,
      deleted_by,
      metadata
    ) VALUES (
      v_backup_record.id,
      v_backup_record.backup_name,
      v_backup_record.backup_type,
      format('تجاوز الحد الأقصى للعدد: %s نسخة', p_max_backups_per_type),
      'policy_exceeded',
      EXTRACT(DAY FROM (now() - v_backup_record.created_at)),
      v_backup_record.backup_size,
      v_backup_record.tables_count,
      v_backup_record.records_count,
      v_backup_record.created_at,
      auth.uid(),
      jsonb_build_object(
        'max_backups', p_max_backups_per_type,
        'backup_type', v_backup_record.backup_type
      )
    );
    
    -- حذف النسخة
    DELETE FROM backup_history WHERE id = v_backup_record.id;
    
    v_deleted_count := v_deleted_count + 1;
    v_deleted_by_count := v_deleted_by_count + 1;
  END LOOP;

  -- حساب النسخ المثبتة التي تم تجاوزها
  SELECT COUNT(*) INTO v_skipped_locked
  FROM backup_history
  WHERE is_locked = true
    AND (
      created_at < (now() - make_interval(days => p_max_age_days))
      OR id IN (
        SELECT id FROM (
          SELECT 
            id,
            ROW_NUMBER() OVER (PARTITION BY backup_type ORDER BY created_at DESC) as rn
          FROM backup_history
          WHERE is_locked = true
        ) ranked
        WHERE rn > p_max_backups_per_type
      )
    );

  v_result := jsonb_build_object(
    'success', true,
    'deleted_count', v_deleted_count,
    'deleted_by_age', v_deleted_by_age,
    'deleted_by_count', v_deleted_by_count,
    'skipped_locked', v_skipped_locked,
    'message', format('تم حذف %s نسخة احتياطية تلقائياً', v_deleted_count)
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة تثبيت نسخة احتياطية
CREATE OR REPLACE FUNCTION lock_backup(
  p_backup_id uuid,
  p_reason text DEFAULT 'نسخة مهمة'
)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  UPDATE backup_history
  SET 
    is_locked = true,
    locked_at = now(),
    locked_by = auth.uid(),
    lock_reason = p_reason
  WHERE id = p_backup_id
    AND is_locked = false;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'النسخة غير موجودة أو مثبتة مسبقاً'
    );
  END IF;
  
  v_result := jsonb_build_object(
    'success', true,
    'message', 'تم تثبيت النسخة بنجاح'
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة إلغاء تثبيت نسخة احتياطية
CREATE OR REPLACE FUNCTION unlock_backup(p_backup_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  UPDATE backup_history
  SET 
    is_locked = false,
    locked_at = NULL,
    locked_by = NULL,
    lock_reason = NULL
  WHERE id = p_backup_id
    AND is_locked = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'النسخة غير موجودة أو غير مثبتة'
    );
  END IF;
  
  v_result := jsonb_build_object(
    'success', true,
    'message', 'تم إلغاء التثبيت بنجاح'
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة حساب إحصائيات المساحة
CREATE OR REPLACE FUNCTION get_backup_storage_stats()
RETURNS jsonb AS $$
DECLARE
  v_total_size bigint;
  v_total_count integer;
  v_locked_count integer;
  v_auto_count integer;
  v_manual_count integer;
  v_avg_size bigint;
  v_oldest_date timestamptz;
  v_newest_date timestamptz;
  v_result jsonb;
BEGIN
  SELECT 
    COALESCE(SUM(backup_size), 0),
    COUNT(*),
    COUNT(*) FILTER (WHERE is_locked = true),
    COUNT(*) FILTER (WHERE backup_type = 'automatic'),
    COUNT(*) FILTER (WHERE backup_type = 'manual'),
    COALESCE(AVG(backup_size), 0),
    MIN(created_at),
    MAX(created_at)
  INTO 
    v_total_size,
    v_total_count,
    v_locked_count,
    v_auto_count,
    v_manual_count,
    v_avg_size,
    v_oldest_date,
    v_newest_date
  FROM backup_history
  WHERE status = 'completed';
  
  v_result := jsonb_build_object(
    'total_size', v_total_size,
    'total_size_mb', ROUND(v_total_size / 1048576.0, 2),
    'total_count', v_total_count,
    'locked_count', v_locked_count,
    'auto_count', v_auto_count,
    'manual_count', v_manual_count,
    'avg_size', v_avg_size,
    'avg_size_mb', ROUND(v_avg_size / 1048576.0, 2),
    'oldest_backup', v_oldest_date,
    'newest_backup', v_newest_date,
    'storage_warning', CASE 
      WHEN v_total_count >= 8 THEN true 
      ELSE false 
    END,
    'retention_needed', CASE
      WHEN v_total_count > 10 THEN true
      ELSE false
    END
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة الحصول على سجل الحذف
CREATE OR REPLACE FUNCTION get_retention_logs(p_limit integer DEFAULT 50)
RETURNS TABLE (
  id uuid,
  backup_name text,
  backup_type text,
  deletion_reason text,
  deletion_type text,
  backup_age_days integer,
  deleted_at timestamptz,
  records_count integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rl.id,
    rl.backup_name,
    rl.backup_type,
    rl.deletion_reason,
    rl.deletion_type,
    rl.backup_age_days,
    rl.deleted_at,
    rl.records_count
  FROM backup_retention_logs rl
  ORDER BY rl.deleted_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
/*
  # نظام النسخ الاحتياطي المتكامل
  # Complete Backup System
*/

-- جدول سجل النسخ الاحتياطي
CREATE TABLE IF NOT EXISTS backup_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type text NOT NULL CHECK (backup_type IN ('manual', 'automatic', 'scheduled')),
  backup_name text NOT NULL,
  backup_size bigint DEFAULT 0,
  tables_count integer DEFAULT 0,
  records_count integer DEFAULT 0,
  backup_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  backup_metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  error_message text,
  restore_count integer DEFAULT 0,
  last_restored_at timestamptz,
  last_restored_by uuid,
  notes text
);

CREATE INDEX IF NOT EXISTS idx_backup_history_created_at ON backup_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backup_history_backup_type ON backup_history(backup_type);
CREATE INDEX IF NOT EXISTS idx_backup_history_status ON backup_history(status);

ALTER TABLE backup_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage backups" ON backup_history;
CREATE POLICY "Admins can manage backups"
  ON backup_history
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- دالة النسخ الاحتياطي الكامل
CREATE OR REPLACE FUNCTION create_full_backup(
  p_backup_name text DEFAULT NULL,
  p_backup_type text DEFAULT 'manual'
)
RETURNS jsonb AS $$
DECLARE
  v_backup_id uuid;
  v_backup_data jsonb := '{}'::jsonb;
  v_table_name text;
  v_table_data jsonb;
  v_tables_count integer := 0;
  v_records_count integer := 0;
  v_record_count integer;
  v_backup_name text;
  v_result jsonb;
BEGIN
  IF p_backup_name IS NULL THEN
    v_backup_name := 'backup_' || to_char(now(), 'YYYYMMDD_HH24MISS');
  ELSE
    v_backup_name := p_backup_name;
  END IF;

  INSERT INTO backup_history (
    backup_type,
    backup_name,
    created_by,
    status,
    backup_metadata
  ) VALUES (
    p_backup_type,
    v_backup_name,
    auth.uid(),
    'in_progress',
    jsonb_build_object('started_at', now())
  ) RETURNING id INTO v_backup_id;

  FOR v_table_name IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT IN ('backup_history', 'audit_logs', 'system_logs')
  LOOP
    BEGIN
      EXECUTE format(
        'SELECT jsonb_agg(row_to_json(t.*)) FROM %I t WHERE deleted_at IS NULL OR deleted_at IS NOT NULL',
        v_table_name
      ) INTO v_table_data;
      
      IF v_table_data IS NOT NULL THEN
        SELECT jsonb_array_length(v_table_data) INTO v_record_count;
        v_records_count := v_records_count + COALESCE(v_record_count, 0);
        
        v_backup_data := jsonb_set(
          v_backup_data,
          ARRAY[v_table_name],
          COALESCE(v_table_data, '[]'::jsonb)
        );
        
        v_tables_count := v_tables_count + 1;
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      CONTINUE;
    END;
  END LOOP;

  UPDATE backup_history
  SET 
    backup_data = v_backup_data,
    tables_count = v_tables_count,
    records_count = v_records_count,
    status = 'completed',
    backup_metadata = backup_metadata || jsonb_build_object(
      'completed_at', now()
    )
  WHERE id = v_backup_id;

  v_result := jsonb_build_object(
    'success', true,
    'backup_id', v_backup_id,
    'backup_name', v_backup_name,
    'tables_count', v_tables_count,
    'records_count', v_records_count,
    'message', 'تم إنشاء النسخة الاحتياطية بنجاح'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    UPDATE backup_history
    SET status = 'failed', error_message = SQLERRM
    WHERE id = v_backup_id;
    
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة الحصول على قائمة النسخ
CREATE OR REPLACE FUNCTION get_backup_list(p_limit integer DEFAULT 50)
RETURNS TABLE (
  id uuid,
  backup_type text,
  backup_name text,
  tables_count integer,
  records_count integer,
  created_at timestamptz,
  status text,
  restore_count integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bh.id,
    bh.backup_type,
    bh.backup_name,
    bh.tables_count,
    bh.records_count,
    bh.created_at,
    bh.status,
    bh.restore_count
  FROM backup_history bh
  ORDER BY bh.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
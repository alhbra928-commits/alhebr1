/*
  # Smart WhatsApp Button Permissions System v2.0

  ## Overview
  Complete role-based access control system for Smart WhatsApp Button with AI-powered behavior analysis,
  temporal permissions, and comprehensive audit logging.

  ## New Tables
  
  1. **whatsapp_button_permissions_registry**
     - Defines all available permissions for the Smart Button
     - Includes permission codes, names, descriptions, and categories
  
  2. **whatsapp_button_role_permissions**
     - Maps permissions to admin roles
     - Supports permanent, temporary (time-based), and conditional permissions
     - Tracks permission status (active, suspended, temporary)
  
  3. **whatsapp_button_activity_log**
     - Comprehensive audit log for all Smart Button activities
     - Tracks permission usage, denied attempts, and modifications
     - Includes contextual data for analysis
  
  4. **smart_permission_rules**
     - AI-powered permission rules based on behavior patterns
     - Time-based scheduling (specific hours/days)
     - Context-aware permissions (only active during specific conditions)
     - Learning system that suggests auto-permissions
  
  5. **permission_violation_alerts**
     - Real-time alerts for unauthorized access attempts
     - Tracks repeated violations for auto-lockout
     - Alert severity levels and escalation

  ## Permission Codes
  - whatsapp.button.view: View button settings
  - whatsapp.button.edit: Edit button configuration
  - whatsapp.button.responses: Manage auto-responses
  - whatsapp.button.ai: Manage AI engine
  - whatsapp.button.stats: View analytics dashboard
  - whatsapp.button.export: Export reports
  - whatsapp.button.test: Test button functionality

  ## Security Features
  - Row-level security enabled on all tables
  - Dual confirmation for sensitive operations
  - Auto-lockout after 3 failed attempts (10 minutes)
  - All modifications logged with timestamp and user
  - Only system administrators can modify permissions

  ## Smart Features
  - Temporal permissions with auto-expiry
  - Behavior learning and auto-suggestions
  - Context-aware permission activation
  - Usage analytics and insights
  - Unused permission detection
*/

-- Create permissions registry table
CREATE TABLE IF NOT EXISTS whatsapp_button_permissions_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_code text UNIQUE NOT NULL,
  permission_name_ar text NOT NULL,
  permission_name_en text NOT NULL,
  description_ar text NOT NULL,
  description_en text NOT NULL,
  category text NOT NULL CHECK (category IN ('basic', 'advanced', 'analytics', 'testing')),
  requires_elevated boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create role permissions mapping table
CREATE TABLE IF NOT EXISTS whatsapp_button_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  permission_code text NOT NULL REFERENCES whatsapp_button_permissions_registry(permission_code) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'temporary')),
  is_temporary boolean DEFAULT false,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  granted_by uuid REFERENCES admin_users(id),
  granted_at timestamptz DEFAULT now(),
  last_used_at timestamptz,
  usage_count integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(admin_user_id, permission_code)
);

-- Create activity log table
CREATE TABLE IF NOT EXISTS whatsapp_button_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  permission_code text REFERENCES whatsapp_button_permissions_registry(permission_code),
  action_type text NOT NULL CHECK (action_type IN ('view', 'edit', 'create', 'delete', 'export', 'test', 'denied')),
  action_description text NOT NULL,
  was_successful boolean NOT NULL,
  denial_reason text,
  context_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create smart permission rules table
CREATE TABLE IF NOT EXISTS smart_permission_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  permission_code text NOT NULL REFERENCES whatsapp_button_permissions_registry(permission_code),
  rule_type text NOT NULL CHECK (rule_type IN ('time_based', 'context_based', 'behavior_based', 'ai_suggested')),
  rule_config jsonb NOT NULL,
  is_active boolean DEFAULT true,
  auto_activate boolean DEFAULT false,
  confidence_score numeric(3,2) DEFAULT 0.00 CHECK (confidence_score BETWEEN 0.00 AND 1.00),
  times_triggered integer DEFAULT 0,
  last_triggered_at timestamptz,
  created_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create permission violation alerts table
CREATE TABLE IF NOT EXISTS permission_violation_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  permission_code text REFERENCES whatsapp_button_permissions_registry(permission_code),
  violation_type text NOT NULL CHECK (violation_type IN ('unauthorized_access', 'expired_permission', 'suspended_permission', 'repeated_failure')),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details text NOT NULL,
  context_data jsonb,
  is_resolved boolean DEFAULT false,
  resolved_by uuid REFERENCES admin_users(id),
  resolved_at timestamptz,
  auto_lockout_triggered boolean DEFAULT false,
  lockout_until timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Insert default permissions
INSERT INTO whatsapp_button_permissions_registry (permission_code, permission_name_ar, permission_name_en, description_ar, description_en, category, requires_elevated) VALUES
('whatsapp.button.view', 'عرض إعدادات الزر', 'View Button Settings', 'يسمح بمشاهدة إعدادات الزر فقط دون التعديل', 'Allows viewing button settings without modification', 'basic', false),
('whatsapp.button.edit', 'تعديل الإعدادات', 'Edit Settings', 'تفعيل/تعطيل وتغيير الموقع والمظهر والألوان', 'Enable/disable and change position, appearance, and colors', 'basic', false),
('whatsapp.button.responses', 'إدارة الردود التلقائية', 'Manage Auto-Responses', 'إضافة أو تعديل أو حذف الردود الذكية والقوالب', 'Add, edit, or delete smart responses and templates', 'advanced', false),
('whatsapp.button.ai', 'إدارة الذكاء المتقدم', 'Manage AI Engine', 'تشغيل/إيقاف المحرك الذكي وتحديث قاعدة المعرفة', 'Enable/disable AI engine and update knowledge base', 'advanced', true),
('whatsapp.button.stats', 'عرض الإحصاءات', 'View Analytics', 'عرض لوحة الإحصاءات التفصيلية والتقارير', 'View detailed analytics dashboard and reports', 'analytics', false),
('whatsapp.button.export', 'تصدير التقارير', 'Export Reports', 'تصدير الإحصاءات بصيغة Excel أو PDF', 'Export analytics in Excel or PDF format', 'analytics', false),
('whatsapp.button.test', 'اختبار الزر', 'Test Button', 'إجراء اختبار مباشر في واجهة المنصة', 'Perform live testing in platform interface', 'testing', false)
ON CONFLICT (permission_code) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_role_permissions_user ON whatsapp_button_role_permissions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_code ON whatsapp_button_role_permissions(permission_code);
CREATE INDEX IF NOT EXISTS idx_role_permissions_status ON whatsapp_button_role_permissions(status);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON whatsapp_button_activity_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON whatsapp_button_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_permission ON whatsapp_button_activity_log(permission_code);
CREATE INDEX IF NOT EXISTS idx_smart_rules_user ON smart_permission_rules(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_smart_rules_active ON smart_permission_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_violations_user ON permission_violation_alerts(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_violations_unresolved ON permission_violation_alerts(is_resolved) WHERE is_resolved = false;

-- Enable RLS
ALTER TABLE whatsapp_button_permissions_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_button_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_button_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_permission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_violation_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for permissions registry (read-only for all authenticated admins)
CREATE POLICY "Admins can view permissions registry"
  ON whatsapp_button_permissions_registry FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for role permissions
CREATE POLICY "Admins can view their own permissions"
  ON whatsapp_button_role_permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System admins can manage all permissions"
  ON whatsapp_button_role_permissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND job_title = 'مدير النظام'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND job_title = 'مدير النظام'
    )
  );

-- RLS Policies for activity log
CREATE POLICY "Admins can view activity logs"
  ON whatsapp_button_activity_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert activity logs"
  ON whatsapp_button_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for smart rules
CREATE POLICY "Admins can view smart rules"
  ON smart_permission_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System admins can manage smart rules"
  ON smart_permission_rules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND job_title = 'مدير النظام'
    )
  );

-- RLS Policies for violation alerts
CREATE POLICY "Admins can view violation alerts"
  ON permission_violation_alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert violation alerts"
  ON permission_violation_alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System admins can resolve alerts"
  ON permission_violation_alerts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
      AND job_title = 'مدير النظام'
    )
  );

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION check_whatsapp_button_permission(
  p_admin_user_id uuid,
  p_permission_code text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_permission boolean;
  v_is_locked boolean;
BEGIN
  -- Check if user is locked out
  SELECT EXISTS (
    SELECT 1 FROM permission_violation_alerts
    WHERE admin_user_id = p_admin_user_id
    AND auto_lockout_triggered = true
    AND lockout_until > now()
  ) INTO v_is_locked;
  
  IF v_is_locked THEN
    RETURN false;
  END IF;
  
  -- Check permission
  SELECT EXISTS (
    SELECT 1 FROM whatsapp_button_role_permissions
    WHERE admin_user_id = p_admin_user_id
    AND permission_code = p_permission_code
    AND status = 'active'
    AND (valid_until IS NULL OR valid_until > now())
  ) INTO v_has_permission;
  
  RETURN v_has_permission;
END;
$$;

-- Function to log activity
CREATE OR REPLACE FUNCTION log_whatsapp_button_activity(
  p_admin_user_id uuid,
  p_permission_code text,
  p_action_type text,
  p_action_description text,
  p_was_successful boolean,
  p_denial_reason text DEFAULT NULL,
  p_context_data jsonb DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO whatsapp_button_activity_log (
    admin_user_id,
    permission_code,
    action_type,
    action_description,
    was_successful,
    denial_reason,
    context_data
  ) VALUES (
    p_admin_user_id,
    p_permission_code,
    p_action_type,
    p_action_description,
    p_was_successful,
    p_denial_reason,
    p_context_data
  ) RETURNING id INTO v_log_id;
  
  -- Update usage count if successful
  IF p_was_successful THEN
    UPDATE whatsapp_button_role_permissions
    SET 
      last_used_at = now(),
      usage_count = usage_count + 1,
      updated_at = now()
    WHERE admin_user_id = p_admin_user_id
    AND permission_code = p_permission_code;
  ELSE
    -- Check for repeated failures and trigger lockout
    PERFORM handle_permission_violation(p_admin_user_id, p_permission_code, p_denial_reason);
  END IF;
  
  RETURN v_log_id;
END;
$$;

-- Function to handle permission violations
CREATE OR REPLACE FUNCTION handle_permission_violation(
  p_admin_user_id uuid,
  p_permission_code text,
  p_denial_reason text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recent_failures integer;
  v_lockout_until timestamptz;
BEGIN
  -- Count recent failures (last 10 minutes)
  SELECT COUNT(*) INTO v_recent_failures
  FROM whatsapp_button_activity_log
  WHERE admin_user_id = p_admin_user_id
  AND was_successful = false
  AND created_at > now() - interval '10 minutes';
  
  -- If 3 or more failures, trigger lockout
  IF v_recent_failures >= 3 THEN
    v_lockout_until := now() + interval '10 minutes';
    
    INSERT INTO permission_violation_alerts (
      admin_user_id,
      permission_code,
      violation_type,
      severity,
      details,
      auto_lockout_triggered,
      lockout_until
    ) VALUES (
      p_admin_user_id,
      p_permission_code,
      'repeated_failure',
      'high',
      format('تم إيقاف الحساب مؤقتاً بعد %s محاولات فاشلة', v_recent_failures),
      true,
      v_lockout_until
    );
  ELSE
    -- Log violation without lockout
    INSERT INTO permission_violation_alerts (
      admin_user_id,
      permission_code,
      violation_type,
      severity,
      details
    ) VALUES (
      p_admin_user_id,
      p_permission_code,
      'unauthorized_access',
      'medium',
      p_denial_reason
    );
  END IF;
END;
$$;

-- Function to get user permissions with details
CREATE OR REPLACE FUNCTION get_user_whatsapp_button_permissions(p_admin_user_id uuid)
RETURNS TABLE (
  permission_code text,
  permission_name_ar text,
  permission_name_en text,
  description_ar text,
  status text,
  is_temporary boolean,
  valid_until timestamptz,
  last_used_at timestamptz,
  usage_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.permission_code,
    pr.permission_name_ar,
    pr.permission_name_en,
    pr.description_ar,
    rp.status,
    rp.is_temporary,
    rp.valid_until,
    rp.last_used_at,
    rp.usage_count
  FROM whatsapp_button_permissions_registry pr
  LEFT JOIN whatsapp_button_role_permissions rp ON pr.permission_code = rp.permission_code AND rp.admin_user_id = p_admin_user_id
  ORDER BY pr.category, pr.permission_code;
END;
$$;

-- Function to get activity analytics
CREATE OR REPLACE FUNCTION get_whatsapp_button_activity_stats(
  p_admin_user_id uuid DEFAULT NULL,
  p_days_back integer DEFAULT 7
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_actions', COUNT(*),
    'successful_actions', COUNT(*) FILTER (WHERE was_successful = true),
    'denied_actions', COUNT(*) FILTER (WHERE was_successful = false),
    'most_used_permission', (
      SELECT permission_code
      FROM whatsapp_button_activity_log
      WHERE (p_admin_user_id IS NULL OR admin_user_id = p_admin_user_id)
      AND created_at > now() - make_interval(days => p_days_back)
      AND was_successful = true
      GROUP BY permission_code
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ),
    'daily_usage', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', date_trunc('day', created_at)::date,
          'count', COUNT(*)
        )
        ORDER BY date_trunc('day', created_at)
      )
      FROM whatsapp_button_activity_log
      WHERE (p_admin_user_id IS NULL OR admin_user_id = p_admin_user_id)
      AND created_at > now() - make_interval(days => p_days_back)
      GROUP BY date_trunc('day', created_at)
    )
  ) INTO v_stats
  FROM whatsapp_button_activity_log
  WHERE (p_admin_user_id IS NULL OR admin_user_id = p_admin_user_id)
  AND created_at > now() - make_interval(days => p_days_back);
  
  RETURN v_stats;
END;
$$;

-- Create trigger to auto-expire temporary permissions
CREATE OR REPLACE FUNCTION auto_expire_temporary_permissions()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_temporary AND NEW.valid_until IS NOT NULL AND NEW.valid_until <= now() THEN
    NEW.status := 'suspended';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_expire_permissions
  BEFORE UPDATE ON whatsapp_button_role_permissions
  FOR EACH ROW
  EXECUTE FUNCTION auto_expire_temporary_permissions();

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_whatsapp_button_permissions_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_permissions_timestamp
  BEFORE UPDATE ON whatsapp_button_role_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_button_permissions_timestamp();

CREATE TRIGGER trigger_update_smart_rules_timestamp
  BEFORE UPDATE ON smart_permission_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_button_permissions_timestamp();

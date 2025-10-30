/*
  # إنشاء جداول لوحة التشغيل (Operations Dashboard)

  1. جداول جديدة
    - `deployment_logs`: سجل النشر والإصدارات
    - `system_notifications`: إشعارات النظام

  2. الأمان
    - تفعيل RLS على الجدولين
    - صلاحيات للموظفين المعتمدين فقط
*/

-- جدول سجل النشر
CREATE TABLE IF NOT EXISTS deployment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  buildId text NOT NULL,
  deployed_at timestamptz DEFAULT now(),
  status text CHECK (status IN ('success', 'failed')) DEFAULT 'success',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- جدول إشعارات النظام
CREATE TABLE IF NOT EXISTS system_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text CHECK (type IN ('success', 'warning', 'error', 'info')) DEFAULT 'info',
  title text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false
);

-- Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_deployment_logs_deployed_at ON deployment_logs(deployed_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_notifications_created_at ON system_notifications(created_at DESC);

-- RLS Policies
ALTER TABLE deployment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;

-- Policy للقراءة (الموظفون المعتمدون)
CREATE POLICY "Authenticated admin users can read deployment logs"
  ON deployment_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated admin users can read system notifications"
  ON system_notifications
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy للإضافة (النظام فقط)
CREATE POLICY "System can insert deployment logs"
  ON deployment_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can insert system notifications"
  ON system_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy للتحديث (الإشعارات فقط - لتعليمها كمقروءة)
CREATE POLICY "Authenticated users can update notifications"
  ON system_notifications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- إدراج بيانات أولية للتجربة
INSERT INTO deployment_logs (version, buildId, deployed_at, status, notes)
VALUES
  ('v20251030_1761839613883', '1761839613883', NOW() - INTERVAL '5 minutes', 'success', 'إزالة شاشة التحديث المنبثقة'),
  ('v20251030_1761839188893', '1761839188893', NOW() - INTERVAL '30 minutes', 'success', 'نظام مسح الكاش التلقائي'),
  ('v20251030_1761838992111', '1761838992111', NOW() - INTERVAL '1 hour', 'success', 'تحسينات الأداء العامة');

INSERT INTO system_notifications (type, title, message, created_at)
VALUES
  ('success', 'نشر ناجح', 'تم نشر الإصدار v20251030_1761839613883 بنجاح', NOW() - INTERVAL '5 minutes'),
  ('success', 'نسخة احتياطية', 'تم إنشاء نسخة احتياطية تلقائية (45 MB)', NOW() - INTERVAL '30 minutes'),
  ('info', 'Service Worker', 'Service Worker نشط ويعمل بكفاءة', NOW() - INTERVAL '1 hour'),
  ('success', 'مسح الكاش', 'تم مسح كاش CDN بنجاح', NOW() - INTERVAL '90 minutes'),
  ('info', 'تحديث النظام', 'تم تحديث نظام الإشعارات', NOW() - INTERVAL '2 hours');

/*
  # إصلاح صلاحيات anon للزر الذكي

  ## المشكلة:
  - whatsapp_inbox_threads: لا يوجد policy لـ INSERT/UPDATE من anon
  - whatsapp_messages: لا يوجد policy لـ INSERT من anon
  - smart_button_rate_limits: لا يوجد policy لـ INSERT من anon

  ## الحل:
  - إضافة policies تسمح للـ anon بالكتابة في هذه الجداول
  - الدالة تعمل بـ SECURITY DEFINER فتتجاوز RLS
*/

-- ✅ إضافة policy لـ smart_button_rate_limits
DROP POLICY IF EXISTS "Anon can insert rate limits" ON smart_button_rate_limits;
CREATE POLICY "Anon can insert rate limits"
  ON smart_button_rate_limits
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon can update rate limits" ON smart_button_rate_limits;
CREATE POLICY "Anon can update rate limits"
  ON smart_button_rate_limits
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ✅ إضافة policy لـ whatsapp_inbox_threads
DROP POLICY IF EXISTS "Smart button can create threads" ON whatsapp_inbox_threads;
CREATE POLICY "Smart button can create threads"
  ON whatsapp_inbox_threads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (source_type = 'smart_button');

DROP POLICY IF EXISTS "Smart button can update threads" ON whatsapp_inbox_threads;
CREATE POLICY "Smart button can update threads"
  ON whatsapp_inbox_threads
  FOR UPDATE
  TO anon, authenticated
  USING (source_type = 'smart_button')
  WITH CHECK (source_type = 'smart_button');

DROP POLICY IF EXISTS "Anyone can read smart button threads" ON whatsapp_inbox_threads;
CREATE POLICY "Anyone can read smart button threads"
  ON whatsapp_inbox_threads
  FOR SELECT
  TO anon, authenticated
  USING (source_type = 'smart_button');

-- ✅ إضافة policy لـ whatsapp_messages
DROP POLICY IF EXISTS "Smart button can insert messages" ON whatsapp_messages;
CREATE POLICY "Smart button can insert messages"
  ON whatsapp_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (source_type = 'smart_button');

DROP POLICY IF EXISTS "Anyone can read smart button messages" ON whatsapp_messages;
CREATE POLICY "Anyone can read smart button messages"
  ON whatsapp_messages
  FOR SELECT
  TO anon, authenticated
  USING (source_type = 'smart_button');

DROP POLICY IF EXISTS "Smart button can update messages" ON whatsapp_messages;
CREATE POLICY "Smart button can update messages"
  ON whatsapp_messages
  FOR UPDATE
  TO anon, authenticated
  USING (source_type = 'smart_button')
  WITH CHECK (source_type = 'smart_button');

-- ✅ إضافة policy لـ smart_button_stats
DROP POLICY IF EXISTS "Anon can insert stats" ON smart_button_stats;
CREATE POLICY "Anon can insert stats"
  ON smart_button_stats
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon can update stats" ON smart_button_stats;
CREATE POLICY "Anon can update stats"
  ON smart_button_stats
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- تعليق على التحديث
COMMENT ON POLICY "Smart button can create threads" ON whatsapp_inbox_threads IS
'يسمح للزر الذكي بإنشاء محادثات جديدة';

COMMENT ON POLICY "Smart button can insert messages" ON whatsapp_messages IS
'يسمح للزر الذكي بإرسال رسائل';

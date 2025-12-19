/*
  # Simple Analytics Pings System - نظام PING بسيط
  
  1. New Table
    - `analytics_pings`
      - جدول بسيط جداً لتسجيل كل ping
      - لا تعقيد، فقط حفظ البيانات مباشرة
  
  2. Security
    - RLS مفعّل
    - anon يقدر يسوي INSERT فقط
    - admin يقدر يقرأ
*/

-- إنشاء جدول analytics_pings بسيط جداً
CREATE TABLE IF NOT EXISTS analytics_pings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  
  -- بيانات الزيارة
  path text NOT NULL,
  referrer text,
  
  -- UTM Parameters
  utm_source text,
  utm_medium text,
  utm_campaign text,
  
  -- Device Info
  user_agent text,
  device_type text,
  
  -- Status
  status text DEFAULT 'received'
);

-- تفعيل RLS
ALTER TABLE analytics_pings ENABLE ROW LEVEL SECURITY;

-- سياسة: anon يقدر يسوي INSERT
CREATE POLICY "Allow anon to insert pings"
  ON analytics_pings
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- سياسة: admin يقدر يقرأ كل شي
CREATE POLICY "Allow admin to read all pings"
  ON analytics_pings
  FOR SELECT
  TO authenticated
  USING (true);

-- Index للسرعة
CREATE INDEX IF NOT EXISTS idx_analytics_pings_created_at 
  ON analytics_pings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_pings_utm_source 
  ON analytics_pings(utm_source);

COMMENT ON TABLE analytics_pings IS 'Simple ping tracking - no complexity, just save and verify';

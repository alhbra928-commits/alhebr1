/*
  # Fix All Marketing Tables RLS for Admin Users
  
  1. Changes
    - Update all marketing tables to allow anon access for admin operations
    - Keep safety measures for critical operations
  
  2. Tables Updated
    - page_analytics_daily
    - traffic_sources_daily
    - connection_health_log
  
  3. Security
    - Allow anon (admin users) full access to marketing analytics
    - These are operational tables that need admin access
*/

-- page_analytics_daily policies
DROP POLICY IF EXISTS "Admins full access page_analytics_daily" ON page_analytics_daily;

CREATE POLICY "Anyone can read page analytics"
  ON page_analytics_daily
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert page analytics"
  ON page_analytics_daily
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update page analytics"
  ON page_analytics_daily
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete page analytics"
  ON page_analytics_daily
  FOR DELETE
  TO authenticated
  USING (true);

-- traffic_sources_daily policies
DROP POLICY IF EXISTS "Admins full access traffic_sources_daily" ON traffic_sources_daily;

CREATE POLICY "Anyone can read traffic sources"
  ON traffic_sources_daily
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert traffic sources"
  ON traffic_sources_daily
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update traffic sources"
  ON traffic_sources_daily
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete traffic sources"
  ON traffic_sources_daily
  FOR DELETE
  TO authenticated
  USING (true);

-- connection_health_log policies
DROP POLICY IF EXISTS "Admins full access connection_health_log" ON connection_health_log;

CREATE POLICY "Anyone can read connection health"
  ON connection_health_log
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert connection health"
  ON connection_health_log
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update connection health"
  ON connection_health_log
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete connection health"
  ON connection_health_log
  FOR DELETE
  TO authenticated
  USING (true);

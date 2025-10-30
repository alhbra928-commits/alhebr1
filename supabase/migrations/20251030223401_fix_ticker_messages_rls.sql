/*
  # Fix Ticker Messages RLS Policies

  1. Changes
    - Add complete RLS policies for ticker_messages table
    - Allow anonymous users full CRUD access (for admin interface)
    - Allow public to view active messages

  2. Security
    - Enable RLS on ticker_messages
    - Policies for all operations
*/

-- Enable RLS if not already enabled
ALTER TABLE ticker_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view ticker messages" ON ticker_messages;
DROP POLICY IF EXISTS "Authenticated users can manage ticker messages" ON ticker_messages;
DROP POLICY IF EXISTS "Allow anon read ticker messages" ON ticker_messages;
DROP POLICY IF EXISTS "Allow anon insert ticker messages" ON ticker_messages;
DROP POLICY IF EXISTS "Allow anon update ticker messages" ON ticker_messages;
DROP POLICY IF EXISTS "Allow anon delete ticker messages" ON ticker_messages;

-- Allow anonymous and authenticated users to read all ticker messages
CREATE POLICY "Allow anon read ticker messages"
  ON ticker_messages
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anonymous and authenticated users to insert ticker messages
CREATE POLICY "Allow anon insert ticker messages"
  ON ticker_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anonymous and authenticated users to update ticker messages
CREATE POLICY "Allow anon update ticker messages"
  ON ticker_messages
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anonymous and authenticated users to delete ticker messages
CREATE POLICY "Allow anon delete ticker messages"
  ON ticker_messages
  FOR DELETE
  TO anon, authenticated
  USING (true);

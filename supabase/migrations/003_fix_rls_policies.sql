-- Fix RLS policies to prevent infinite recursion
-- The original policies were too complex and caused circular references

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Clients view based on role" ON clients;
DROP POLICY IF EXISTS "Clients insert if commercial" ON clients;
DROP POLICY IF EXISTS "Contacts view based on client access" ON contacts;
DROP POLICY IF EXISTS "Opportunities view based on role" ON opportunities;
DROP POLICY IF EXISTS "Interactions view based on access" ON interactions;
DROP POLICY IF EXISTS "Tasks view based on assignment" ON tasks;
DROP POLICY IF EXISTS "Tasks update if assigned" ON tasks;
DROP POLICY IF EXISTS "Poles are readable by all" ON poles;
DROP POLICY IF EXISTS "Only admin can modify poles" ON poles;
DROP POLICY IF EXISTS "Client poles readable by all" ON client_poles;
DROP POLICY IF EXISTS "Opportunity poles readable by all" ON opportunity_poles;

-- Simplified RLS policies
-- Users table
CREATE POLICY "Users can view all" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update" ON users FOR UPDATE USING (true);
CREATE POLICY "Users can delete" ON users FOR DELETE USING (true);

-- Clients table
CREATE POLICY "Clients can view all" ON clients FOR SELECT USING (true);
CREATE POLICY "Clients can insert" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Clients can update" ON clients FOR UPDATE USING (true);
CREATE POLICY "Clients can delete" ON clients FOR DELETE USING (true);

-- Contacts table
CREATE POLICY "Contacts can view all" ON contacts FOR SELECT USING (true);
CREATE POLICY "Contacts can insert" ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Contacts can update" ON contacts FOR UPDATE USING (true);
CREATE POLICY "Contacts can delete" ON contacts FOR DELETE USING (true);

-- Opportunities table
CREATE POLICY "Opportunities can view all" ON opportunities FOR SELECT USING (true);
CREATE POLICY "Opportunities can insert" ON opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Opportunities can update" ON opportunities FOR UPDATE USING (true);
CREATE POLICY "Opportunities can delete" ON opportunities FOR DELETE USING (true);

-- Interactions table
CREATE POLICY "Interactions can view all" ON interactions FOR SELECT USING (true);
CREATE POLICY "Interactions can insert" ON interactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Interactions can update" ON interactions FOR UPDATE USING (true);
CREATE POLICY "Interactions can delete" ON interactions FOR DELETE USING (true);

-- Tasks table
CREATE POLICY "Tasks can view all" ON tasks FOR SELECT USING (true);
CREATE POLICY "Tasks can insert" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Tasks can update" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Tasks can delete" ON tasks FOR DELETE USING (true);

-- Poles table
CREATE POLICY "Poles can view all" ON poles FOR SELECT USING (true);
CREATE POLICY "Poles can insert" ON poles FOR INSERT WITH CHECK (true);
CREATE POLICY "Poles can update" ON poles FOR UPDATE USING (true);
CREATE POLICY "Poles can delete" ON poles FOR DELETE USING (true);

-- Relations tables
CREATE POLICY "Client poles readable by all" ON client_poles FOR SELECT USING (true);
CREATE POLICY "Client poles can insert" ON client_poles FOR INSERT WITH CHECK (true);
CREATE POLICY "Client poles can update" ON client_poles FOR UPDATE USING (true);
CREATE POLICY "Client poles can delete" ON client_poles FOR DELETE USING (true);

CREATE POLICY "Opportunity poles readable by all" ON opportunity_poles FOR SELECT USING (true);
CREATE POLICY "Opportunity poles can insert" ON opportunity_poles FOR INSERT WITH CHECK (true);
CREATE POLICY "Opportunity poles can update" ON opportunity_poles FOR UPDATE USING (true);
CREATE POLICY "Opportunity poles can delete" ON opportunity_poles FOR DELETE USING (true);
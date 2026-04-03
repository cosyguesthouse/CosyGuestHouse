-- ============================================================
-- Migration: QR Payment Flow + Admin Notifications System
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Update bookings table with payment fields
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT,
  ADD COLUMN IF NOT EXISTS advance_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC;

-- 2. Create payment_settings table
CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_image_url TEXT,
  advance_percentage NUMERIC DEFAULT 50,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default row if not exists
INSERT INTO payment_settings (advance_percentage)
SELECT 50
WHERE NOT EXISTS (SELECT 1 FROM payment_settings);

-- 3. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('booking', 'payment', 'contact', 'feedback')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Supabase Storage bucket for payment screenshots
-- (Run this or create manually in Supabase Dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('payment_screenshots', 'payment_screenshots', true)
-- ON CONFLICT (id) DO NOTHING;

-- 5. Enable Row Level Security (RLS) for new tables
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow public read access to payment_settings (for frontend QR display)
DROP POLICY IF EXISTS "Public can read payment_settings" ON payment_settings;
CREATE POLICY "Public can read payment_settings"
  ON payment_settings FOR SELECT
  USING (true);

-- Allow authenticated admins full access to payment_settings
DROP POLICY IF EXISTS "Admins can manage payment_settings" ON payment_settings;
CREATE POLICY "Admins can manage payment_settings"
  ON payment_settings FOR ALL
  USING (auth.role() = 'authenticated');

-- Allow authenticated admins full access to notifications
DROP POLICY IF EXISTS "Admins can manage notifications" ON notifications;
CREATE POLICY "Admins can manage notifications"
  ON notifications FOR ALL
  USING (auth.role() = 'authenticated');

-- Allow anyone to insert notifications (triggered by public forms)
DROP POLICY IF EXISTS "Public can insert notifications" ON notifications;
CREATE POLICY "Public can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Allow public read for payment_screenshots storage bucket
-- (Set bucket to public in Supabase Dashboard or via API)

-- ============================================================
-- NOTE: After running this migration:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Create a bucket named: payment_screenshots
-- 3. Set it as Public
-- ============================================================

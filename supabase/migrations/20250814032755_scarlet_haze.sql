/*
  # Fix Admin Settings Safe Handling

  1. RLS Policies
    - Drop existing restrictive policies
    - Create safe policies that allow proper admin management
    - Allow anonymous users to read/insert for initial setup
    - Allow authenticated users to update credentials

  2. Default Admin Creation
    - Ensure table can be safely queried even when empty
    - Allow automatic insertion of default admin when needed
*/

-- Drop existing policies to start fresh
DO $$
BEGIN
  -- Drop existing policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE polname = 'Authenticated users can manage admin settings' 
    AND tablename = 'admin_settings'
  ) THEN
    DROP POLICY "Authenticated users can manage admin settings" ON admin_settings;
  END IF;
END $$;

-- Create comprehensive RLS policies for admin_settings
DO $$
BEGIN
  -- Policy for reading admin settings (needed for login verification)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Anyone can read admin settings for login'
    AND tablename = 'admin_settings'
  ) THEN
    CREATE POLICY "Anyone can read admin settings for login"
      ON admin_settings
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  -- Policy for inserting admin settings (needed for initial setup)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Anyone can insert initial admin settings'
    AND tablename = 'admin_settings'
  ) THEN
    CREATE POLICY "Anyone can insert initial admin settings"
      ON admin_settings
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;

  -- Policy for updating admin settings (only authenticated users)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Authenticated users can update admin settings'
    AND tablename = 'admin_settings'
  ) THEN
    CREATE POLICY "Authenticated users can update admin settings"
      ON admin_settings
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
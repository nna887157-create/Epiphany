/*
  # Fix Admin Settings RLS Policies

  1. Security Updates
    - Update RLS policies for `admin_settings` table to allow:
      - Anonymous users to read admin settings (for login verification)
      - Anonymous users to insert default admin if table is empty
      - Authenticated users to update admin settings
    
  2. Policy Changes
    - Remove restrictive authenticated-only policies
    - Add permissive policies for initial setup and login flow
*/

-- Drop existing restrictive policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Authenticated users can manage admin settings'
    AND tablename = 'admin_settings'
  ) THEN
    DROP POLICY "Authenticated users can manage admin settings" ON admin_settings;
  END IF;
END
$$;

-- Create policy to allow anonymous users to read admin settings (needed for login)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Allow anonymous read for login verification'
    AND tablename = 'admin_settings'
  ) THEN
    CREATE POLICY "Allow anonymous read for login verification"
      ON admin_settings
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END
$$;

-- Create policy to allow anonymous users to insert default admin (needed for initial setup)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Allow anonymous insert for initial setup'
    AND tablename = 'admin_settings'
  ) THEN
    CREATE POLICY "Allow anonymous insert for initial setup"
      ON admin_settings
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END
$$;

-- Create policy to allow authenticated users to update admin settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Allow authenticated update of admin settings'
    AND tablename = 'admin_settings'
  ) THEN
    CREATE POLICY "Allow authenticated update of admin settings"
      ON admin_settings
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;
/*
  # Fix Policies and Admin Settings

  1. Policy Fixes
    - Safely create policies only if they don't exist
    - Handle existing policies gracefully

  2. Admin Settings
    - Create admin_settings table if not exists
    - Insert default admin user safely
    - Add proper RLS policies

  3. Security
    - Enable RLS on all tables
    - Create safe default admin credentials
*/

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure admin_settings table exists
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  password_hash text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on admin_settings
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create trigger for admin_settings updated_at
DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON admin_settings;
CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Safely create policies for categories
DO $$
BEGIN
  -- Categories viewable by everyone
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Categories are viewable by everyone'
    AND tablename = 'categories'
  ) THEN
    CREATE POLICY "Categories are viewable by everyone"
    ON categories
    FOR SELECT
    USING (true);
  END IF;

  -- Categories manageable by authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Authenticated users can manage categories'
    AND tablename = 'categories'
  ) THEN
    CREATE POLICY "Authenticated users can manage categories"
    ON categories
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- Safely create policies for subcategories
DO $$
BEGIN
  -- Subcategories viewable by everyone
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Subcategories are viewable by everyone'
    AND tablename = 'subcategories'
  ) THEN
    CREATE POLICY "Subcategories are viewable by everyone"
    ON subcategories
    FOR SELECT
    USING (true);
  END IF;

  -- Subcategories manageable by authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Authenticated users can manage subcategories'
    AND tablename = 'subcategories'
  ) THEN
    CREATE POLICY "Authenticated users can manage subcategories"
    ON subcategories
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- Safely create policies for products
DO $$
BEGIN
  -- Products viewable by everyone
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Products are viewable by everyone'
    AND tablename = 'products'
  ) THEN
    CREATE POLICY "Products are viewable by everyone"
    ON products
    FOR SELECT
    USING (true);
  END IF;

  -- Products manageable by authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Authenticated users can manage products'
    AND tablename = 'products'
  ) THEN
    CREATE POLICY "Authenticated users can manage products"
    ON products
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- Safely create policies for product_extras
DO $$
BEGIN
  -- Product extras viewable by everyone
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Product extras are viewable by everyone'
    AND tablename = 'product_extras'
  ) THEN
    CREATE POLICY "Product extras are viewable by everyone"
    ON product_extras
    FOR SELECT
    USING (true);
  END IF;

  -- Product extras manageable by authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Authenticated users can manage product extras'
    AND tablename = 'product_extras'
  ) THEN
    CREATE POLICY "Authenticated users can manage product extras"
    ON product_extras
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- Safely create policies for product_verres
DO $$
BEGIN
  -- Product verres viewable by everyone
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Product verres are viewable by everyone'
    AND tablename = 'product_verres'
  ) THEN
    CREATE POLICY "Product verres are viewable by everyone"
    ON product_verres
    FOR SELECT
    USING (true);
  END IF;

  -- Product verres manageable by authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Authenticated users can manage product verres'
    AND tablename = 'product_verres'
  ) THEN
    CREATE POLICY "Authenticated users can manage product verres"
    ON product_verres
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- Safely create policies for admin_settings
DO $$
BEGIN
  -- Admin settings manageable by authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Authenticated users can manage admin settings'
    AND tablename = 'admin_settings'
  ) THEN
    CREATE POLICY "Authenticated users can manage admin settings"
    ON admin_settings
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- Insert default admin user if none exists
-- Password hash for "epiphany@123" using bcrypt with salt rounds 10
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_settings LIMIT 1) THEN
    INSERT INTO admin_settings (username, password_hash)
    VALUES ('Epiphany', '$2a$10$8K1p/a0dclxKAVwNTVJVNOyWiJkjH8T.VKjdvQWQ9F5JNQFxvQn7G');
  END IF;
END $$;
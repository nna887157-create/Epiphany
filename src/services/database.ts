import { supabase } from '../lib/supabase';
import { Category, Product, Subcategory, Extra, Verre, AdminCredentials } from '../types';
import bcrypt from 'bcryptjs';

// Categories
export const getCategories = async (): Promise<Category[]> => {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at');

  if (error) throw error;

  const categoriesWithSubcategories = await Promise.all(
    categories.map(async (category) => {
      const { data: subcategories } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', category.id)
        .order('created_at');

      return {
        ...category,
        subcategories: subcategories || []
      };
    })
  );

  return categoriesWithSubcategories;
};

export const createCategory = async (category: Omit<Category, 'id' | 'subcategories'>) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCategory = async (id: string, category: Partial<Category>) => {
  const { data, error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCategory = async (id: string) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Subcategories
export const createSubcategory = async (subcategory: Omit<Subcategory, 'id'>) => {
  const { data, error } = await supabase
    .from('subcategories')
    .insert([subcategory])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateSubcategory = async (id: string, subcategory: Partial<Subcategory>) => {
  const { data, error } = await supabase
    .from('subcategories')
    .update(subcategory)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteSubcategory = async (id: string) => {
  const { error } = await supabase
    .from('subcategories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at');

  if (error) throw error;

  const productsWithExtras = await Promise.all(
    products.map(async (product) => {
      const [{ data: extras }, { data: verres }] = await Promise.all([
        supabase
          .from('product_extras')
          .select('*')
          .eq('product_id', product.id),
        supabase
          .from('product_verres')
          .select('*')
          .eq('product_id', product.id)
      ]);

      return {
        ...product,
        extras: extras || [],
        verres: verres || []
      };
    })
  );

  return productsWithExtras;
};

export const createProduct = async (product: Omit<Product, 'id' | 'extras' | 'verres'>) => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Product Extras
export const createProductExtra = async (extra: Omit<Extra, 'id'> & { product_id: string }) => {
  const { data, error } = await supabase
    .from('product_extras')
    .insert([extra])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteProductExtra = async (id: string) => {
  const { error } = await supabase
    .from('product_extras')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Product Verres
export const createProductVerre = async (verre: Omit<Verre, 'id'> & { product_id: string }) => {
  const { data, error } = await supabase
    .from('product_verres')
    .insert([verre])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteProductVerre = async (id: string) => {
  const { error } = await supabase
    .from('product_verres')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Admin Settings
export const getAdminCredentials = async (): Promise<AdminCredentials | null> => {
  try {
    // Use select() without .single() to avoid PGRST116 error when no rows exist
    const { data, error } = await supabase
      .from('admin_settings')
      .select('username, password_hash')
      .limit(1);

    if (error) {
      throw error;
    }

    // If no data returned (empty table), create default admin
    if (!data || data.length === 0) {
      const hashedPassword = await bcrypt.hash('epiphany@123', 10);
      const { data: newData, error: insertError } = await supabase
        .from('admin_settings')
        .insert([{
          username: 'Epiphany',
          password_hash: hashedPassword
        }])
        .select('username, password_hash')
        .single();
      
      if (insertError) {
        console.error('Failed to create default admin:', insertError);
        // Return default credentials as fallback
        return {
          username: 'Epiphany',
          password: ''
        };
      }
      
      return {
        username: newData.username,
        password: '' // Don't return actual password
      };
    }

    // Return the first (and should be only) admin record
    return {
      username: data[0].username,
      password: '' // Don't return actual password
    };
  } catch (error) {
    console.error('Error in getAdminCredentials:', error);
    // Final fallback: try to create default admin
    try {
      const hashedPassword = await bcrypt.hash('epiphany@123', 10);
      const { data: newData, error: insertError } = await supabase
        .from('admin_settings')
        .insert([{
          username: 'Epiphany',
          password_hash: hashedPassword
        }])
        .select('username, password_hash');
      
      if (insertError) {
        console.error('Fallback admin creation failed:', insertError);
        // Return default credentials as last resort
        return {
          username: 'Epiphany',
          password: ''
        };
      }
      
      return {
        username: newData[0]?.username || 'Epiphany',
        password: ''
      };
    } catch (fallbackError) {
      console.error('Final fallback failed:', fallbackError);
      // Return hardcoded default
      return {
        username: 'Epiphany',
        password: ''
      };
    }
  }
};

export const verifyAdminCredentials = async (username: string, password: string): Promise<boolean> => {
  try {
    // Use select() without .single() to avoid PGRST116 error
    const { data, error } = await supabase
      .from('admin_settings')
      .select('username, password_hash')
      .limit(1);

    if (error) {
      console.error('Error querying admin settings:', error);
      // Fallback to default credentials check
      const isUsernameValid = username === 'Epiphany';
      const isPasswordValid = password === 'epiphany@123';
      
      if (isUsernameValid && isPasswordValid) {
        // Try to create the admin record for future use
        try {
          const hashedPassword = await bcrypt.hash('epiphany@123', 10);
          await supabase
            .from('admin_settings')
            .insert([{
              username: 'Epiphany',
              password_hash: hashedPassword
            }]);
        } catch (insertError) {
          console.error('Failed to create admin record:', insertError);
        }
        return true;
      }
      return false;
    }

    // If no data returned (empty table), check against defaults and create record
    if (!data || data.length === 0) {
      const isUsernameValid = username === 'Epiphany';
      const isPasswordValid = password === 'epiphany@123';
      
      if (isUsernameValid && isPasswordValid) {
        // Create the admin record
        try {
          const hashedPassword = await bcrypt.hash('epiphany@123', 10);
          await supabase
            .from('admin_settings')
            .insert([{
              username: 'Epiphany',
              password_hash: hashedPassword
            }]);
        } catch (insertError) {
          console.error('Failed to create admin record:', insertError);
        }
        return true;
      }
      return false;
    }

    // Verify against stored credentials
    const adminRecord = data[0];
    const isUsernameValid = adminRecord.username === username;
    const isPasswordValid = await bcrypt.compare(password, adminRecord.password_hash);

    return isUsernameValid && isPasswordValid;
  } catch (error) {
    console.error('Error in verifyAdminCredentials:', error);
    // Fallback to default credentials
    const isUsernameValid = username === 'Epiphany';
    const isPasswordValid = password === 'epiphany@123';
    return isUsernameValid && isPasswordValid;
  }
};

export const updateAdminCredentials = async (username: string, password: string) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if any admin record exists
    const { data: existingData, error: selectError } = await supabase
      .from('admin_settings')
      .select('id')
      .limit(1);
    
    if (!selectError && existingData && existingData.length > 0) {
      // Update existing record
      const { data, error } = await supabase
        .from('admin_settings')
        .update({
          username,
          password_hash: hashedPassword
        })
        .eq('id', existingData[0].id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('admin_settings')
        .insert([{
          username,
          password_hash: hashedPassword
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error in updateAdminCredentials:', error);
    throw error;
  }
};
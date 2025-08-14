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
  const { data, error } = await supabase
    .from('admin_settings')
    .select('username, password_hash')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No admin settings found, create default
      const hashedPassword = await bcrypt.hash('Epiphany@123', 10);
      await supabase
        .from('admin_settings')
        .insert([{
          username: 'Epiphany',
          password_hash: hashedPassword
        }]);
      
      return {
        username: 'Epiphany',
        password: 'Epiphany@123'
      };
    }
    throw error;
  }

  return {
    username: data.username,
    password: '' // Don't return actual password
  };
};

export const verifyAdminCredentials = async (username: string, password: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('username, password_hash')
    .single();

  if (error) return false;

  const isUsernameValid = data.username === username;
  const isPasswordValid = await bcrypt.compare(password, data.password_hash);

  return isUsernameValid && isPasswordValid;
};

export const updateAdminCredentials = async (username: string, password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const { data, error } = await supabase
    .from('admin_settings')
    .upsert([{
      username,
      password_hash: hashedPassword
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};
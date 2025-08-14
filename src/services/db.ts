import { supabase } from '../lib/supabase';
import { Category, Subcategory, ProductInput, SubcategoryInput } from '../types/database';

/**
 * Create a new category in the database
 */
export const createCategory = async (name: string, image: string): Promise<Category> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: name.trim(), image: image.trim() }])
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw new Error(`Failed to create category: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('createCategory error:', error);
    throw error;
  }
};

/**
 * Bulk create subcategories for a given category
 * Filters out empty names automatically
 */
export const createSubcategories = async (subcategoryNames: string[], categoryId: string): Promise<void> => {
  try {
    // Filter out empty names and prepare rows
    const rows: SubcategoryInput[] = subcategoryNames
      .filter(name => name.trim().length > 0)
      .map(name => ({
        name: name.trim(),
        category_id: categoryId
      }));

    // Only insert if we have valid subcategories
    if (rows.length === 0) {
      return;
    }

    const { error } = await supabase
      .from('subcategories')
      .insert(rows);

    if (error) {
      console.error('Error creating subcategories:', error);
      throw new Error(`Failed to create subcategories: ${error.message}`);
    }
  } catch (error) {
    console.error('createSubcategories error:', error);
    throw error;
  }
};

/**
 * Fetch all categories
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, image, created_at, updated_at')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('getCategories error:', error);
    throw error;
  }
};

/**
 * Fetch subcategories for a specific category
 */
export const getSubcategoriesByCategory = async (categoryId: string): Promise<Subcategory[]> => {
  try {
    const { data, error } = await supabase
      .from('subcategories')
      .select('id, name, category_id, created_at, updated_at')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching subcategories:', error);
      throw new Error(`Failed to fetch subcategories: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('getSubcategoriesByCategory error:', error);
    throw error;
  }
};

/**
 * Create a new product
 */
export const createProduct = async (input: ProductInput): Promise<void> => {
  try {
    // Validate required fields
    if (!input.title.trim() || !input.image.trim() || !input.category_id || !input.subcategory_id) {
      throw new Error('Missing required fields for product creation');
    }

    if (input.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    const productData = {
      title: input.title.trim(),
      image: input.image.trim(),
      price: input.price,
      description: input.description?.trim() || '',
      category_id: input.category_id,
      subcategory_id: input.subcategory_id
    };

    const { error } = await supabase
      .from('products')
      .insert([productData]);

    if (error) {
      console.error('Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  } catch (error) {
    console.error('createProduct error:', error);
    throw error;
  }
};
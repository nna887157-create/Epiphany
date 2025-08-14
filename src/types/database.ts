export interface Category {
  id: string;
  name: string;
  image: string;
  created_at?: string;
  updated_at?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductInput {
  title: string;
  image: string;
  price: number;
  description?: string;
  category_id: string;
  subcategory_id: string;
}

export interface Product extends ProductInput {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface SubcategoryInput {
  name: string;
  category_id: string;
}
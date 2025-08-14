export interface Category {
  id: string;
  name: string;
  image: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface Product {
  id: string;
  title: string;
  image: string;
  price: number;
  description: string;
  categoryId: string;
  subcategoryId: string;
  extras?: Extra[];
  verres?: Verre[];
}

export interface Extra {
  id: string;
  name: string;
  price: number;
}

export interface Verre {
  id: string;
  name: string;
  price: number;
}

export interface AdminCredentials {
  username: string;
  password: string;
}
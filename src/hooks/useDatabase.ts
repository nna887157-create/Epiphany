import { useState, useEffect } from 'react';
import { Category, Product, AdminCredentials } from '../types';
import * as db from '../services/database';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await db.getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await db.getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
};

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState<AdminCredentials | null>(null);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const isValid = await db.verifyAdminCredentials(username, password);
      if (isValid) {
        setIsAuthenticated(true);
        const creds = await db.getAdminCredentials();
        setCredentials(creds);
      }
      return isValid;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCredentials(null);
  };

  const updateCredentials = async (username: string, password: string) => {
    try {
      await db.updateAdminCredentials(username, password);
      const updatedCreds = await db.getAdminCredentials();
      setCredentials(updatedCreds);
    } catch (error) {
      console.error('Update credentials error:', error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    credentials,
    login,
    logout,
    updateCredentials
  };
};
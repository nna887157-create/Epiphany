import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { getCategories, getSubcategoriesByCategory, createProduct } from '../services/db';
import { Category, Subcategory, ProductInput } from '../types/database';

interface ProductFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSuccess, onError }) => {
  // Form state
  const [formData, setFormData] = useState<ProductInput>({
    title: '',
    image: '',
    price: 0,
    description: '',
    category_id: '',
    subcategory_id: ''
  });

  // Data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  // Loading states
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load categories';
        onError?.(errorMessage);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, [onError]);

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (!formData.category_id) {
        setSubcategories([]);
        return;
      }

      try {
        setIsLoadingSubcategories(true);
        const subcategoriesData = await getSubcategoriesByCategory(formData.category_id);
        setSubcategories(subcategoriesData);
      } catch (error) {
        console.error('Error loading subcategories:', error);
        setSubcategories([]);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load subcategories';
        onError?.(errorMessage);
      } finally {
        setIsLoadingSubcategories(false);
      }
    };

    loadSubcategories();
  }, [formData.category_id, onError]);

  // Handle input changes
  const handleInputChange = (field: keyof ProductInput, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle category change (clear subcategory selection)
  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      category_id: categoryId,
      subcategory_id: '' // Clear subcategory when category changes
    }));

    // Clear category and subcategory errors
    setErrors(prev => ({
      ...prev,
      category_id: '',
      subcategory_id: ''
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.image.trim()) {
      newErrors.image = 'L\'URL de l\'image est requise';
    } else {
      try {
        new URL(formData.image);
      } catch {
        newErrors.image = 'Veuillez entrer une URL valide';
      }
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Le prix doit être supérieur à 0';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Veuillez sélectionner une catégorie';
    }

    if (!formData.subcategory_id) {
      newErrors.subcategory_id = 'Veuillez sélectionner une sous-catégorie';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      image: '',
      price: 0,
      description: '',
      category_id: '',
      subcategory_id: ''
    });
    setSubcategories([]);
    setErrors({});
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createProduct(formData);
      
      // Success handling
      resetForm();
      onSuccess?.();
      
      // Show success message (replace with your toast system)
      alert('Produit créé avec succès !');
      
    } catch (error) {
      console.error('Error creating product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      onError?.(errorMessage);
      
      // Show error message (replace with your toast system)
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Créer un Nouveau Produit</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Titre *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Pizza Margherita, Coca-Cola..."
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Image URL */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
            URL de l'image *
          </label>
          <input
            id="image"
            type="url"
            value={formData.image}
            onChange={(e) => handleInputChange('image', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
              errors.image ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="https://example.com/product-image.jpg"
            disabled={isSubmitting}
          />
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Prix (Dh) *
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price || ''}
            onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
            disabled={isSubmitting}
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description (optionnel)
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
            placeholder="Description du produit..."
            disabled={isSubmitting}
          />
        </div>

        {/* Category Selection */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie *
          </label>
          <select
            id="category"
            value={formData.category_id}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
              errors.category_id ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoadingCategories || isSubmitting}
          >
            <option value="">
              {isLoadingCategories ? 'Chargement des catégories...' : 'Sélectionner une catégorie'}
            </option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
          )}
        </div>

        {/* Subcategory Selection */}
        <div>
          <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">
            Sous-catégorie *
          </label>
          <select
            id="subcategory"
            value={formData.subcategory_id}
            onChange={(e) => handleInputChange('subcategory_id', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
              errors.subcategory_id ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={!formData.category_id || isLoadingSubcategories || isSubmitting}
          >
            <option value="">
              {!formData.category_id 
                ? 'Sélectionnez d\'abord une catégorie'
                : isLoadingSubcategories 
                ? 'Chargement des sous-catégories...'
                : subcategories.length === 0
                ? 'Aucune sous-catégorie disponible'
                : 'Sélectionner une sous-catégorie'
              }
            </option>
            {subcategories.map(subcategory => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
          {errors.subcategory_id && (
            <p className="mt-1 text-sm text-red-600">{errors.subcategory_id}</p>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={resetForm}
            disabled={isSubmitting}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Réinitialiser
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoadingCategories}
            className="flex-1 bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Créer le Produit
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
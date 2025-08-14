import React, { useState } from 'react';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { createCategory, createSubcategories } from '../services/db';

interface CategoryFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onSuccess, onError }) => {
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState('');
  const [subcategories, setSubcategories] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Add a new subcategory input field
  const addSubcategory = () => {
    setSubcategories([...subcategories, '']);
  };

  // Remove a subcategory input field
  const removeSubcategory = (index: number) => {
    if (subcategories.length > 1) {
      const newSubcategories = subcategories.filter((_, i) => i !== index);
      setSubcategories(newSubcategories);
    }
  };

  // Update a specific subcategory name
  const updateSubcategory = (index: number, value: string) => {
    const newSubcategories = [...subcategories];
    newSubcategories[index] = value;
    setSubcategories(newSubcategories);
  };

  // Validate form inputs
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!categoryName.trim()) {
      newErrors.categoryName = 'Le nom de la catégorie est requis';
    }

    if (!categoryImage.trim()) {
      newErrors.categoryImage = 'L\'URL de l\'image est requise';
    } else {
      // Basic URL validation
      try {
        new URL(categoryImage);
      } catch {
        newErrors.categoryImage = 'Veuillez entrer une URL valide';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset form to initial state
  const resetForm = () => {
    setCategoryName('');
    setCategoryImage('');
    setSubcategories(['']);
    setErrors({});
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create the category
      const newCategory = await createCategory(categoryName, categoryImage);
      
      // Step 2: Create subcategories (filters out empty names automatically)
      await createSubcategories(subcategories, newCategory.id);

      // Success handling
      resetForm();
      onSuccess?.();
      
      // Show success message (you can replace with your toast system)
      alert('Catégorie et sous-catégories créées avec succès !');
      
    } catch (error) {
      console.error('Error creating category:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      onError?.(errorMessage);
      
      // Show error message (you can replace with your toast system)
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Créer une Nouvelle Catégorie</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Name */}
        <div>
          <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-2">
            Nom de la catégorie *
          </label>
          <input
            id="categoryName"
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
              errors.categoryName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Boissons, Plats principaux..."
            disabled={isLoading}
          />
          {errors.categoryName && (
            <p className="mt-1 text-sm text-red-600">{errors.categoryName}</p>
          )}
        </div>

        {/* Category Image */}
        <div>
          <label htmlFor="categoryImage" className="block text-sm font-medium text-gray-700 mb-2">
            URL de l'image *
          </label>
          <input
            id="categoryImage"
            type="url"
            value={categoryImage}
            onChange={(e) => setCategoryImage(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
              errors.categoryImage ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="https://example.com/image.jpg"
            disabled={isLoading}
          />
          {errors.categoryImage && (
            <p className="mt-1 text-sm text-red-600">{errors.categoryImage}</p>
          )}
        </div>

        {/* Subcategories */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Sous-catégories
            </label>
            <button
              type="button"
              onClick={addSubcategory}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Ajouter une sous-catégorie
            </button>
          </div>
          
          <div className="space-y-3">
            {subcategories.map((subcategory, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => updateSubcategory(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                  placeholder={`Sous-catégorie ${index + 1} (optionnel)`}
                  disabled={isLoading}
                />
                {subcategories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubcategory(index)}
                    disabled={isLoading}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <p className="mt-2 text-sm text-gray-500">
            Les champs vides seront ignorés lors de la sauvegarde.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={resetForm}
            disabled={isLoading}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Réinitialiser
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Créer la Catégorie
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
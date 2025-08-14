import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import { useCategories, useProducts } from '../hooks/useDatabase';
import { Product } from '../types';

const ProductsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading } = useCategories();
  const { products, loading: productsLoading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');

  const loading = categoriesLoading || productsLoading;

  const category = useMemo(() => {
    return categories.find(cat => cat.id === id);
  }, [id, categories]);

  const categoryProducts = useMemo(() => {
    return products.filter(product => product.categoryId === id);
  }, [id, products]);

  const filteredProducts = useMemo(() => {
    if (selectedSubcategory === 'all') {
      return categoryProducts;
    }
    return categoryProducts.filter(product => product.subcategoryId === selectedSubcategory);
  }, [categoryProducts, selectedSubcategory]);

  const productsGroupedBySubcategory = useMemo(() => {
    const groups: { [key: string]: Product[] } = {};
    
    if (!category) return groups;

    category.subcategories.forEach(subcategory => {
      groups[subcategory.id] = categoryProducts.filter(
        product => product.subcategoryId === subcategory.id
      );
    });

    return groups;
  }, [category, categoryProducts]);

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Catégorie non trouvée</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors duration-200"
          >
            Retour à l'Accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                {category.name}
              </h1>
              <p className="text-sm text-gray-600">
                {categoryProducts.length} articles disponibles
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Mobile Subcategory Tabs */}
        <div className="mb-6 sm:hidden">
          <div className="flex overflow-x-auto gap-2 pb-2">
            <button
              onClick={() => setSelectedSubcategory('all')}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedSubcategory === 'all'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tous les Articles
            </button>
            {category.subcategories.map(subcategory => (
              <button
                key={subcategory.id}
                onClick={() => setSelectedSubcategory(subcategory.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedSubcategory === subcategory.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {subcategory.name}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Layout - Subcategory Sections */}
        <div className="hidden sm:block">
          {category.subcategories.map(subcategory => {
            const subcategoryProducts = productsGroupedBySubcategory[subcategory.id];
            
            if (!subcategoryProducts || subcategoryProducts.length === 0) {
              return null;
            }

            return (
              <div key={subcategory.id} className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-amber-600 pb-2">
                  {subcategory.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {subcategoryProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={() => setSelectedProduct(product)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Layout - Filtered Products */}
        <div className="sm:hidden">
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        </div>

        {/* Empty State */}
        {categoryProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Bientôt Disponible
            </h3>
            <p className="text-gray-500">
              Nous travaillons à l'ajout d'articles dans cette catégorie.
            </p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};

export default ProductsPage;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Settings, LogOut } from 'lucide-react';
import QRCodeManager from '../components/QRCodeManager';
import AdminLogin from '../components/AdminLogin';
import { useCategories, useProducts, useAdminAuth } from '../hooks/useDatabase';
import * as db from '../services/database';
import { Category, Product, Subcategory, Extra, Verre, AdminCredentials } from '../types';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, credentials, login, logout, updateCredentials } = useAdminAuth();
  const { categories, loading: categoriesLoading, refetch: refetchCategories } = useCategories();
  const { products, loading: productsLoading, refetch: refetchProducts } = useProducts();
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'categories' | 'products' | 'qr' | 'settings'>('categories');
  
  // Form states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);

  // Category form
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    image: '',
    subcategories: [] as Subcategory[]
  });

  // Product form
  const [productForm, setProductForm] = useState({
    title: '',
    image: '',
    price: 0,
    description: '',
    categoryId: '',
    subcategoryId: '',
    extras: [] as Extra[],
    verres: [] as Verre[]
  });

  // Credentials form
  const [credentialsForm, setCredentialsForm] = useState({
    username: '',
    password: ''
  });

  const handleLogin = async (username: string, password: string) => {
    const success = await login(username, password);
    if (success) {
      setLoginError('');
    } else {
      setLoginError('Nom d\'utilisateur ou mot de passe incorrect');
    }
  };

  const handleUpdateCredentials = async () => {
    try {
      await updateCredentials(credentialsForm.username, credentialsForm.password);
      setShowCredentialsForm(false);
      alert('Identifiants mis à jour avec succès !');
    } catch (error) {
      alert('Erreur lors de la mise à jour des identifiants');
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} error={loginError} />;
  }

  const handleEditCategory = async (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      image: category.image,
      subcategories: [...category.subcategories]
    });
    setShowCategoryForm(true);
  };

  const handleSaveCategory = async () => {
    try {
    if (editingCategory) {
        await db.updateCategory(editingCategory.id, categoryForm);
    } else {
        await db.createCategory(categoryForm);
    }
    
      await refetchCategories();
    // Reset form
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryForm({ name: '', image: '', subcategories: [] });
    } catch (error) {
      alert('Erreur lors de la sauvegarde de la catégorie');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      try {
        await db.deleteCategory(categoryId);
        await refetchCategories();
        await refetchProducts();
      } catch (error) {
        alert('Erreur lors de la suppression de la catégorie');
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      image: product.image,
      price: product.price,
      description: product.description,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId,
      extras: product.extras || [],
      verres: product.verres || []
    });
    setShowProductForm(true);
  };

  const handleSaveProduct = async () => {
    try {
    if (editingProduct) {
        await db.updateProduct(editingProduct.id, productForm);
    } else {
        const newProduct = await db.createProduct(productForm);
        
        // Add extras and verres
        for (const extra of productForm.extras) {
          await db.createProductExtra({ ...extra, product_id: newProduct.id });
        }
        for (const verre of productForm.verres) {
          await db.createProductVerre({ ...verre, product_id: newProduct.id });
        }
    }
    
      await refetchProducts();
    // Reset form
    setShowProductForm(false);
    setEditingProduct(null);
    setProductForm({
      title: '',
      image: '',
      price: 0,
      description: '',
      categoryId: '',
      subcategoryId: '',
      extras: [],
      verres: []
    });
    } catch (error) {
      alert('Erreur lors de la sauvegarde du produit');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await db.deleteProduct(productId);
        await refetchProducts();
      } catch (error) {
        alert('Erreur lors de la suppression du produit');
      }
    }
  };

  const addSubcategory = () => {
    const name = prompt('Entrez le nom de la sous-catégorie :');
    if (name) {
      const newSubcategory: Subcategory = {
        id: Date.now().toString(),
        name,
        categoryId: editingCategory?.id || 'new'
      };
      setCategoryForm({
        ...categoryForm,
        subcategories: [...categoryForm.subcategories, newSubcategory]
      });
    }
  };

  const removeSubcategory = (subcategoryId: string) => {
    setCategoryForm({
      ...categoryForm,
      subcategories: categoryForm.subcategories.filter(sub => sub.id !== subcategoryId)
    });
  };

  const addExtra = () => {
    const name = prompt('Entrez le nom de l\'extra :');
    const priceStr = prompt('Entrez le prix de l\'extra (en Dh) :');
    if (name && priceStr) {
      const newExtra: Extra = {
        id: Date.now().toString(),
        name,
        price: parseFloat(priceStr) || 0
      };
      setProductForm({
        ...productForm,
        extras: [...productForm.extras, newExtra]
      });
    }
  };

  const removeExtra = (extraId: string) => {
    setProductForm({
      ...productForm,
      extras: productForm.extras.filter(extra => extra.id !== extraId)
    });
  };

  const addVerre = () => {
    const name = prompt('Entrez le nom du verre :');
    const priceStr = prompt('Entrez le prix du verre (en Dh) :');
    if (name && priceStr) {
      const newVerre: Verre = {
        id: Date.now().toString(),
        name,
        price: parseFloat(priceStr) || 0
      };
      setProductForm({
        ...productForm,
        verres: [...productForm.verres, newVerre]
      });
    }
  };

  const removeVerre = (verreId: string) => {
    setProductForm({
      ...productForm,
      verres: productForm.verres.filter(verre => verre.id !== verreId)
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Panneau d'Administration
            </h1>
            <button
              onClick={logout}
              className="ml-auto p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-600"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { key: 'categories', label: 'Catégories' },
              { key: 'products', label: 'Produits' },
              { key: 'qr', label: 'Codes QR' },
              { key: 'settings', label: 'Paramètres' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.key
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Gérer les Catégories</h2>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ name: '', image: '', subcategories: [] });
                  setShowCategoryForm(true);
                }}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter une Catégorie
              </button>
            </div>

            {/* Categories List */}
            <div className="grid gap-4">
              {categories.map(category => (
                <div key={category.id} className="bg-white p-4 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        <p className="text-gray-600 text-sm">
                          {category.subcategories.length} sous-catégories
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Gérer les Produits</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    title: '',
                    image: '',
                    price: 0,
                    description: '',
                    categoryId: '',
                    subcategoryId: '',
                    extras: [],
                    verres: []
                  });
                  setShowProductForm(true);
                }}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter un Produit
              </button>
            </div>

            {/* Products List */}
            <div className="grid gap-4">
              {products.map(product => {
                const category = categories.find(cat => cat.id === product.categoryId);
                return (
                  <div key={product.id} className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-lg">{product.title}</h3>
                          <p className="text-amber-600 font-bold">{product.price} Dh</p>
                          <p className="text-gray-600 text-sm">
                            {category?.name} • {(product.extras?.length || 0) + (product.verres?.length || 0)} options
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* QR Codes Tab */}
        {activeTab === 'qr' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Générateur de Code QR</h2>
            <QRCodeManager />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Paramètres</h2>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Identifiants Administrateur</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom d'utilisateur actuel
                  </label>
                  <p className="text-gray-600 bg-gray-50 p-2 rounded">{credentials?.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <p className="text-gray-600 bg-gray-50 p-2 rounded">••••••••••</p>
                </div>
                <button
                  onClick={() => {
                    setCredentialsForm({
                      username: credentials?.username || '',
                      password: ''
                    });
                    setShowCredentialsForm(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Modifier les Identifiants
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCategoryForm(false)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {editingCategory ? 'Modifier la Catégorie' : 'Ajouter une Catégorie'}
                </h3>
                <button
                  onClick={() => setShowCategoryForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la Catégorie
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de l'Image
                  </label>
                  <input
                    type="url"
                    value={categoryForm.image}
                    onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Sous-catégories
                    </label>
                    <button
                      type="button"
                      onClick={addSubcategory}
                      className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors duration-200"
                    >
                      Ajouter une Sous-catégorie
                    </button>
                  </div>
                  <div className="space-y-2">
                    {categoryForm.subcategories.map(subcategory => (
                      <div key={subcategory.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                        <span className="text-sm">{subcategory.name}</span>
                        <button
                          onClick={() => removeSubcategory(subcategory.id)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCategoryForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="flex-1 bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowProductForm(false)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {editingProduct ? 'Modifier le Produit' : 'Ajouter un Produit'}
                </h3>
                <button
                  onClick={() => setShowProductForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre du Produit
                  </label>
                  <input
                    type="text"
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de l'Image
                  </label>
                  <input
                    type="url"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix (Dh)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value, subcategoryId: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner une Catégorie</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {productForm.categoryId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sous-catégorie
                    </label>
                    <select
                      value={productForm.subcategoryId}
                      onChange={(e) => setProductForm({ ...productForm, subcategoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner une Sous-catégorie</option>
                      {categories.find(cat => cat.id === productForm.categoryId)?.subcategories.map(subcategory => (
                        <option key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Extras/Suppléments
                    </label>
                    <button
                      type="button"
                      onClick={addExtra}
                      className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors duration-200"
                    >
                      Ajouter un Extra
                    </button>
                  </div>
                  <div className="space-y-2">
                    {productForm.extras.map(extra => (
                      <div key={extra.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                        <div>
                          <span className="text-sm font-medium">{extra.name}</span>
                          <span className="text-sm text-gray-500 ml-2">{extra.price} Dh</span>
                        </div>
                        <button
                          onClick={() => removeExtra(extra.id)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Options de Verres
                    </label>
                    <button
                      type="button"
                      onClick={addVerre}
                      className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors duration-200"
                    >
                      Ajouter un Verre
                    </button>
                  </div>
                  <div className="space-y-2">
                    {productForm.verres.map(verre => (
                      <div key={verre.id} className="flex items-center justify-between bg-blue-50 p-2 rounded-lg">
                        <div>
                          <span className="text-sm font-medium">{verre.name}</span>
                          <span className="text-sm text-gray-500 ml-2">{verre.price} Dh</span>
                        </div>
                        <button
                          onClick={() => removeVerre(verre.id)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowProductForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveProduct}
                  className="flex-1 bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Form Modal */}
      {showCredentialsForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCredentialsForm(false)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  Modifier les Identifiants
                </h3>
                <button
                  onClick={() => setShowCredentialsForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    value={credentialsForm.username}
                    onChange={(e) => setCredentialsForm({ ...credentialsForm, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau Mot de passe
                  </label>
                  <input
                    type="password"
                    value={credentialsForm.password}
                    onChange={(e) => setCredentialsForm({ ...credentialsForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCredentialsForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateCredentials}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Mettre à jour
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
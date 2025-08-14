import React from 'react';
import { Product, Extra, Verre } from '../types';
import { X } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 scale-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="relative h-56 sm:h-64 overflow-hidden rounded-t-2xl">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-20" />
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              {product.title}
            </h2>
            <span className="text-2xl font-bold text-amber-600 ml-4">
              {product.price} Dh
            </span>
          </div>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {product.description}
          </p>
          
          {product.extras && product.extras.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Suppléments & Extras
              </h3>
              <div className="space-y-2">
                {product.extras.map((extra: Extra) => (
                  <div
                    key={extra.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <span className="text-gray-700 font-medium">{extra.name}</span>
                    <span className="text-amber-600 font-semibold">+{extra.price} Dh</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {product.verres && product.verres.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Options de Verres
              </h3>
              <div className="space-y-2">
                {product.verres.map((verre: Verre) => (
                  <div
                    key={verre.id}
                    className="flex justify-between items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                  >
                    <span className="text-gray-700 font-medium">{verre.name}</span>
                    <span className="text-blue-600 font-semibold">{verre.price} Dh</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200"
            >
              Fermer
            </button>
            <button
              className="flex-1 bg-amber-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-amber-700 transition-colors duration-200"
              onClick={() => {
                // Here you could add to cart functionality
                alert('Ajouté à la commande ! (Fonctionnalité de démonstration)');
              }}
            >
              Ajouter à la Commande
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
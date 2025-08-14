import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative h-32 sm:h-40 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-base sm:text-lg font-semibold text-gray-800 line-clamp-1">
            {product.title}
          </h4>
          <span className="text-amber-600 font-bold text-base sm:text-lg ml-2">
            ${product.price}
          </span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
          {product.description}
        </p>
        <div className="space-y-1">
          {product.extras && product.extras.length > 0 && (
            <div className="text-xs text-amber-600 font-medium">
              Extras: {product.extras.map(extra => `${extra.name} (+${extra.price} Dh)`).join(', ')}
            </div>
          )}
          {product.verres && product.verres.length > 0 && (
            <div className="text-xs text-blue-600 font-medium">
              Verres: {product.verres.map(verre => `${verre.name} (${verre.price} Dh)`).join(', ')}
            </div>
          )}
        </div>
        {((product.extras && product.extras.length > 0) || (product.verres && product.verres.length > 0)) && (
          <div className="text-xs text-green-600 font-medium mt-1">
            Personnalisable
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
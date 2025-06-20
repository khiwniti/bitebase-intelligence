import React from 'react';
import { Restaurant } from '@/lib/api-client';

interface RestaurantCardProps {
  restaurant: Restaurant;
  showFeaturedBadge?: boolean;
  className?: string;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ 
  restaurant, 
  showFeaturedBadge = false,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {restaurant.imageUrl ? (
        <img 
          src={restaurant.imageUrl} 
          alt={restaurant.name} 
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48" />
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800">{restaurant.name}</h3>
          {showFeaturedBadge && restaurant.featured && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Featured
            </span>
          )}
        </div>
        
        <div className="mt-2 flex items-center">
          <span className="text-yellow-500">★</span>
          <span className="text-gray-600 ml-1">{restaurant.rating?.toFixed(1)}</span>
          <span className="mx-2 text-gray-300">•</span>
          <span className="text-gray-600">{restaurant.category}</span>
        </div>
        
        <p className="mt-2 text-gray-600 text-sm line-clamp-2">
          {restaurant.description || 'No description available'}
        </p>
        
        {restaurant.promotion && (
          <div className="mt-3 bg-blue-50 border border-blue-100 text-blue-800 text-sm p-2 rounded">
            {restaurant.promotion}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantCard;
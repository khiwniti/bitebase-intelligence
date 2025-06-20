import React from 'react';
import { apiClient } from '@/lib/api-client';
import { Restaurant } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import RestaurantCard from './RestaurantCard';
import { MapPin, Star, Clock } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function FeaturedRestaurants() {
  const { data: locationData } = useQuery({
    queryKey: ['user-location'],
    queryFn: async () => {
      const response = await apiClient.get('/user/location');
      return response.data;
    }
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['featured-restaurants', locationData],
    queryFn: async () => {
      const response = await apiClient.get('/restaurants/featured', {
        params: {
          lat: locationData?.latitude || 37.7749,
          lng: locationData?.longitude || -122.4194,
          radius: 5000 // 5km radius
        }
      });
      if (response.error) throw new Error(response.error);
      return response.data.restaurants;
    },
    enabled: !!locationData
  });

  if (isLoading) return <div className="text-center py-8">Loading featured restaurants...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error loading featured restaurants: {error.message}</div>;
  if (!data || data.length === 0) return <div className="text-center py-8">No featured restaurants found</div>;

  return (
    <div className="featured-restaurants py-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Featured Restaurants</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map(restaurant => (
          <div 
            key={restaurant.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105"
          >
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <img 
                src={restaurant.images?.[0] || 'https://picsum.photos/400/300'} 
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold mb-2">{restaurant.name}</h3>
              <div className="flex items-center text-yellow-500 mb-2">
                <Star className="w-5 h-5 fill-current" />
                <span className="ml-1">{restaurant.rating}</span>
                <span className="ml-2 text-gray-600">({restaurant.review_count} reviews)</span>
              </div>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{restaurant.address}</span>
              </div>
              <div className="flex items-center text-gray-600 mb-2">
                <Clock className="w-4 h-4 mr-1" />
                <span>{restaurant.hours}</span>
              </div>
              <div className="mt-4">
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Featured
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

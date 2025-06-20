import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Info, Star, TrendingUp, Users, Utensils, Navigation, RefreshCw, Target } from 'lucide-react';
import { MapContainer } from './MapContainer';
import { Marker } from 'react-map-gl';
import { RestaurantMarker } from './RestaurantMarker';
import { useLocationBasedRestaurants } from '../../hooks/useRestaurantData';
import { apiClient } from '../../lib/api-client';

// Layer styles for heatmap
const heatmapLayerStyle = {
  id: 'heatmap',
  type: 'heatmap',
  maxzoom: 15,
  paint: {
    'heatmap-weight': ['interpolate', ['linear'], ['get', 'value'], 0, 0, 1, 1],
    'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'rgba(33,102,172,0)',
      0.2, 'rgb(103,169,207)',
      0.4, 'rgb(209,229,240)',
      0.6, 'rgb(253,219,199)',
      0.8, 'rgb(239,138,98)',
      1, 'rgb(178,24,43)'
    ],
    'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
    'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 0.5]
  }
};

// Circle layer style for opportunities
const opportunityLayerStyle = {
  id: 'opportunities',
  type: 'circle',
  minzoom: 7,
  paint: {
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, 4, 16, 20],
    'circle-color': ['interpolate', ['linear'], ['get', 'score'], 0, '#FFC300', 0.5, '#FF5733', 1, '#C70039'],
    'circle-opacity': 0.8,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff'
  }
};

// Demographic layer style for demographic data
const demographicLayerStyle = {
  id: 'demographics',
  type: 'fill',
  paint: {
    'fill-color': ['interpolate', ['linear'], ['get', 'population'], 0, '#f2efea', 5000, '#a6cee3', 10000, '#1f78b4', 20000, '#08306b'],
    'fill-opacity': 0.7,
    'fill-outline-color': '#000000'
  }
};

// Traffic layer style for foot traffic data
const trafficLayerStyle = {
  id: 'traffic',
  type: 'line',
  paint: {
    'line-color': ['interpolate', ['linear'], ['get', 'count'], 0, '#ffffcc', 100, '#a1dab4', 500, '#41b6c4', 1000, '#225ea8'],
    'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 15, 4],
    'line-opacity': 0.8
  }
};

interface LocationOpportunityMapProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  heatmapData?: GeoJSON.FeatureCollection;
  opportunityData?: GeoJSON.FeatureCollection;
  demographicData?: GeoJSON.FeatureCollection;
  trafficData?: GeoJSON.FeatureCollection;
  existingLocations?: Array<{
    id: string;
    name: string;
    position: [number, number];
    type: string;
    rating?: number;
  }>;
  onLocationClick?: (location: any) => void;
  onMapClick?: (event: any) => void;
  className?: string;
  activeLayer?: 'heatmap' | 'opportunities' | 'demographics' | 'traffic' | 'all';
}

export default function LocationOpportunityMap({
  initialCenter = [100.5018, 13.7563], // Bangkok coordinates
  initialZoom = 12,
  heatmapData,
  opportunityData,
  demographicData,
  trafficData,
  existingLocations = [],
  onLocationClick,
  onMapClick,
  className = '',
  activeLayer = 'all'
}: LocationOpportunityMapProps) {
  const [viewport, setViewport] = useState({
    longitude: initialCenter[0],
    latitude: initialCenter[1],
    zoom: initialZoom
  });

  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Use location-based restaurant data
  const {
    restaurants,
    loading: restaurantsLoading,
    error: restaurantsError,
    userLocation,
    refetch: refetchRestaurants
  } = useLocationBasedRestaurants();

  const [realRestaurants, setRealRestaurants] = useState<any[]>([]);
  const [loadingRealData, setLoadingRealData] = useState(false);

  // Fetch real restaurant data for the current viewport
  const fetchRealRestaurantData = useCallback(async (lat: number, lng: number) => {
    setLoadingRealData(true);
    try {
      console.log(`🔍 Fetching opportunity map restaurants near: ${lat}, ${lng}`);

      const response = await apiClient.searchRestaurantsByLocation(lat, lng, 5);

      if (response.data && response.data.length > 0) {
        console.log(`✅ Found ${response.data.length} restaurants for opportunity analysis`);
        setRealRestaurants(response.data);
      } else {
        setRealRestaurants([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch restaurant data for opportunity map:', error);
      setRealRestaurants([]);
    } finally {
      setLoadingRealData(false);
    }
  }, []);

  // Fetch restaurants when viewport changes
  useEffect(() => {
    fetchRealRestaurantData(viewport.latitude, viewport.longitude);
  }, [viewport.latitude, viewport.longitude, fetchRealRestaurantData]);

  // Handle map click
  const handleMapClick = useCallback((event: any) => {
    // Close popup if clicking elsewhere
    setSelectedLocation(null);

    if (onMapClick) {
      onMapClick(event);
    }
  }, [onMapClick]);

  // Handle location marker click
  const handleLocationClick = useCallback((location: any) => {
    setSelectedLocation(location);

    if (onLocationClick) {
      onLocationClick(location);
    }
  }, [onLocationClick]);

  // Get icon color based on location type
  const getIconColor = (type: string) => {
    switch (type) {
      case 'restaurant':
        return 'text-red-500';
      case 'cafe':
        return 'text-amber-500';
      case 'opportunity':
        return 'text-primary-500';
      default:
        return 'text-blue-500';
    }
  };

  // Show or hide layers based on activeLayer prop
  const shouldShowLayer = (layer: string) => {
    if (activeLayer === 'all') return true;
    return activeLayer === layer;
  };

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`} style={{ height: '100%', minHeight: '400px' }}>
      <MapContainer
        center={[viewport.latitude, viewport.longitude]}
        zoom={viewport.zoom}
        height="100%"
        className="w-full"
        onViewportChange={setViewport}
        onClick={handleMapClick}
      >
        {/* Real Restaurant Markers from Foursquare API */}
        {realRestaurants
          .filter(restaurant => restaurant.latitude != null && restaurant.longitude != null)
          .map((restaurant, index) => (
            <Marker
              key={`real-${restaurant.id}`}
              longitude={Number(restaurant.longitude)}
              latitude={Number(restaurant.latitude)}
              anchor="bottom"
            >
              <div className="relative cursor-pointer" onClick={() => handleLocationClick({
                ...restaurant,
                type: 'restaurant',
                position: [Number(restaurant.latitude), Number(restaurant.longitude)]
              })}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <MapPin className="h-6 w-6 text-red-500 drop-shadow-lg" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                </motion.div>
              </div>
            </Marker>
          ))}

        {/* Existing Locations Markers */}
        {existingLocations.map((location, index) => (
          <Marker
            key={location.id}
            longitude={location.position[0]}
            latitude={location.position[1]}
            anchor="bottom"
          >
            <div className="relative cursor-pointer" onClick={() => handleLocationClick(location)}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <MapPin className={`h-6 w-6 ${getIconColor(location.type)}`} />
              </motion.div>
            </div>
          </Marker>
        ))}

        {/* Selected location popup */}
        {selectedLocation && (
          <div className="absolute z-20"
            style={{
              left: `calc(${viewport.longitude} + 50%)`,
              top: `calc(${viewport.latitude} + 50%)`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm">
              <button
                onClick={() => setSelectedLocation(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
              <h3 className="font-medium text-gray-900">{selectedLocation.name}</h3>
              {selectedLocation.type && (
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <Utensils className="w-3 h-3" />
                  <span className="capitalize">{selectedLocation.type}</span>
                </div>
              )}
              {selectedLocation.rating && (
                <div className="flex items-center gap-1 text-sm mt-1">
                  <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                  <span>{selectedLocation.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Map Controls */}
        <div className="absolute top-2 right-2 bg-white shadow-md rounded-md flex flex-col p-1 space-y-1">
          <button
            onClick={() => setViewport(v => ({ ...v, zoom: v.zoom + 1 }))}
            className="p-2 hover:bg-gray-100 rounded text-sm font-medium"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => setViewport(v => ({ ...v, zoom: Math.max(v.zoom - 1, 1) }))}
            className="p-2 hover:bg-gray-100 rounded text-sm font-medium"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={() => fetchRealRestaurantData(viewport.latitude, viewport.longitude)}
            className="p-2 hover:bg-gray-100 rounded"
            title="Refresh Restaurant Data"
            disabled={loadingRealData}
          >
            <RefreshCw className={`w-4 h-4 ${loadingRealData ? 'animate-spin' : ''}`} />
          </button>
          {userLocation && (
            <button
              onClick={() => setViewport({
                latitude: userLocation.lat,
                longitude: userLocation.lng,
                zoom: 14
              })}
              className="p-2 hover:bg-gray-100 rounded"
              title="Go to My Location"
            >
              <Navigation className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Real-time Data Status */}
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 shadow-md rounded-md p-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${realRestaurants.length > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="font-medium">
              {loadingRealData ? 'Loading...' : `${realRestaurants.length} Real Restaurants`}
            </span>
          </div>
          {userLocation && (
            <div className="flex items-center space-x-1 mt-1">
              <Target className="w-3 h-3 text-blue-500" />
              <span className="text-gray-600">Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 shadow-md rounded-md p-2 text-xs max-w-xs">
          <h4 className="font-medium mb-1 flex items-center">
            <Info className="w-3 h-3 mr-1" /> Map Legend
          </h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {shouldShowLayer('heatmap') && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-red-500 rounded-full"></div>
                <span>Market Potential</span>
              </div>
            )}
            {shouldShowLayer('opportunities') && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                <span>Opportunities</span>
              </div>
            )}
            {shouldShowLayer('demographics') && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-800 rounded-full"></div>
                <span>Population Density</span>
              </div>
            )}
            {shouldShowLayer('traffic') && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Foot Traffic</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-red-500" />
              <span>Restaurants</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-500" />
              <span>Cafes</span>
            </div>
          </div>
        </div>
      </MapContainer>
    </div>
  );
}
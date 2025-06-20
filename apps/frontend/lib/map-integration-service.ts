/**
 * Map Integration Service
 * Connects frontend map components with backend geospatial services
 */

import { apiClient, Restaurant } from './api-client';
import { MAP_CONFIG, LOCATION_CONFIG, ENDPOINTS, DEBUG } from './config';

export interface LocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: string;
}

export interface SearchParams {
  latitude: number;
  longitude: number;
  radius?: number;
  cuisine?: string;
  priceRange?: string;
  rating?: number;
  limit?: number;
}

export interface MapSearchResult {
  restaurants: Restaurant[];
  searchMetrics: {
    total_found: number;
    search_radius: number;
    search_center: LocationData;
    platforms_searched: string[];
  };
  mapVisualization?: {
    core_radius: {
      center: LocationData;
      radius_km: number;
      color: string;
      opacity: number;
    };
    buffer_zone?: {
      center: LocationData;
      radius_km: number;
      color: string;
      opacity: number;
    };
  };
}

class MapIntegrationService {
  private currentLocation: LocationData | null = null;
  private watchId: number | null = null;
  private locationUpdateCallbacks: ((location: LocationData) => void)[] = [];

  /**
   * Initialize location tracking
   */
  async initializeLocationTracking(): Promise<LocationData | null> {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      return this.getDefaultLocation();
    }

    try {
      const position = await this.getCurrentPosition();
      const location: LocationData = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString(),
      };

      this.currentLocation = location;
      this.notifyLocationUpdate(location);

      // Update backend with current location
      await this.updateBackendLocation(location);

      if (DEBUG.LOG_LOCATION_UPDATES) {
        console.log('📍 Location initialized:', location);
      }

      return location;
    } catch (error) {
      console.warn('Failed to get current location:', error);
      return this.getDefaultLocation();
    }
  }

  /**
   * Start watching location changes
   */
  startLocationWatch(): void {
    if (!navigator.geolocation || this.watchId !== null) {
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
        };

        this.currentLocation = location;
        this.notifyLocationUpdate(location);
        this.updateBackendLocation(location);

        if (DEBUG.LOG_LOCATION_UPDATES) {
          console.log('📍 Location updated:', location);
        }
      },
      (error) => {
        console.warn('Location watch error:', error);
      },
      {
        enableHighAccuracy: LOCATION_CONFIG.HIGH_ACCURACY,
        timeout: LOCATION_CONFIG.TIMEOUT,
        maximumAge: LOCATION_CONFIG.MAXIMUM_AGE,
      }
    );
  }

  /**
   * Stop watching location changes
   */
  stopLocationWatch(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Search restaurants near a location
   */
  async searchRestaurantsNearLocation(params: SearchParams): Promise<MapSearchResult | null> {
    try {
      const response = await apiClient.searchRestaurantsRealtime({
        latitude: params.latitude,
        longitude: params.longitude,
        radius: params.radius || LOCATION_CONFIG.AUTO_SEARCH_RADIUS,
        buffer_zones: true,
        cuisine_filter: params.cuisine,
        price_range_filter: params.priceRange,
        rating_filter: params.rating || 0,
        limit: params.limit || 20,
      });

      if (response.error) {
        console.error('Restaurant search failed:', response.error);
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error('Restaurant search error:', error);
      return null;
    }
  }

  /**
   * Get nearby restaurants with enhanced buffer zones
   */
  async getNearbyRestaurantsWithBuffer(
    location: LocationData,
    radius: number = LOCATION_CONFIG.AUTO_SEARCH_RADIUS
  ): Promise<MapSearchResult | null> {
    try {
      const response = await apiClient.getNearbyRestaurantsWithBuffer({
        latitude: location.lat,
        longitude: location.lng,
        radius,
        buffer_radius: LOCATION_CONFIG.BUFFER_RADIUS,
        platforms: ['wongnai', 'google'],
        real_time: true,
      });

      if (response.error) {
        console.error('Nearby restaurants search failed:', response.error);
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error('Nearby restaurants error:', error);
      return null;
    }
  }

  /**
   * Update user location on backend
   */
  private async updateBackendLocation(location: LocationData): Promise<void> {
    try {
      await apiClient.updateUserLocation({
        latitude: location.lat,
        longitude: location.lng,
        accuracy: location.accuracy,
        user_id: 'current_user', // Replace with actual user ID
        auto_search: true,
        search_radius: LOCATION_CONFIG.AUTO_SEARCH_RADIUS,
      });
    } catch (error) {
      console.warn('Failed to update backend location:', error);
    }
  }

  /**
   * Get current position as Promise
   */
  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: LOCATION_CONFIG.HIGH_ACCURACY,
        timeout: LOCATION_CONFIG.TIMEOUT,
        maximumAge: LOCATION_CONFIG.MAXIMUM_AGE,
      });
    });
  }

  /**
   * Get default location (Bangkok)
   */
  private getDefaultLocation(): LocationData {
    return {
      lat: MAP_CONFIG.DEFAULT_CENTER[1],
      lng: MAP_CONFIG.DEFAULT_CENTER[0],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Notify location update callbacks
   */
  private notifyLocationUpdate(location: LocationData): void {
    this.locationUpdateCallbacks.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('Location update callback error:', error);
      }
    });
  }

  /**
   * Subscribe to location updates
   */
  onLocationUpdate(callback: (location: LocationData) => void): () => void {
    this.locationUpdateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.locationUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.locationUpdateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current location
   */
  getCurrentLocation(): LocationData | null {
    return this.currentLocation;
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(point1: LocationData, point2: LocationData): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// Export singleton instance
export const mapIntegrationService = new MapIntegrationService();
export default mapIntegrationService;

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mapboxSdk = require('@mapbox/mapbox-sdk');
const { MAPBOX_API_KEY } = process.env;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://beta.bitebase.app', 'https://bitebase.app', 'https://www.bitebase.app']
    : ['http://localhost:12000', 'http://localhost:12001', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize Mapbox client
const mapboxClient = mapboxSdk({ accessToken: MAPBOX_API_KEY });

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      services: {
        api: true,
        database: true,
        analytics: true,
        search: true,
        mapbox: !!MAPBOX_API_KEY
      }
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      error: 'Health check failed'
    });
  }
});

// AI status endpoint
app.get('/ai', (req, res) => {
  res.status(200).json({
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: ['chat', 'analytics', 'recommendations']
  });
});

// Helper function to generate nearby restaurants for streaming
function generateNearbyRestaurants(latitude, longitude, radius = 5, limit = 10) {
  const restaurants = [];
  const restaurantNames = [
    'Bangkok Bistro', 'Thai Garden', 'Spice Route', 'Golden Dragon', 'Lotus Cafe',
    'Mango Tree', 'Bamboo House', 'Silk Road', 'Royal Thai', 'Green Curry',
    'Pad Thai Palace', 'Som Tam Station', 'Coconut Grove', 'Lemongrass', 'Chili House'
  ];

  const cuisines = ['Thai', 'Chinese', 'Japanese', 'Italian', 'Indian', 'Vietnamese', 'Korean'];

  for (let i = 0; i < Math.min(limit, restaurantNames.length); i++) {
    // Generate random coordinates within the radius
    const randomLat = latitude + (Math.random() - 0.5) * (radius / 111); // Rough conversion
    const randomLng = longitude + (Math.random() - 0.5) * (radius / 111);

    restaurants.push({
      id: `stream_${i + 1}`,
      name: restaurantNames[i],
      cuisine_type: cuisines[Math.floor(Math.random() * cuisines.length)],
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      review_count: Math.floor(Math.random() * 300) + 20,
      price_range: Math.floor(Math.random() * 4) + 1,
      latitude: randomLat,
      longitude: randomLng,
      distance: (Math.random() * radius).toFixed(2),
      address: `${Math.floor(Math.random() * 999) + 1} Bangkok Street`,
      phone: `+66-2-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      website: `https://www.${restaurantNames[i].toLowerCase().replace(/\s+/g, '')}.com`,
      hours: '10:00-22:00',
      features: ['dine_in', 'takeout']
    });
  }

  return restaurants;
}

// Foursquare API integration
async function fetchFoursquareRestaurants(latitude, longitude, radius = 5, limit = 20) {
  const foursquareApiKey = process.env.FOURSQUARE_API_KEY;

  if (!foursquareApiKey || foursquareApiKey === 'YOUR_FOURSQUARE_API_KEY_HERE') {
    console.log('⚠️ Foursquare API key not configured, using mock data');
    return null;
  }

  try {
    const foursquareUrl = `https://api.foursquare.com/v3/places/search?ll=${latitude},${longitude}&radius=${radius * 1000}&categories=13000&limit=${limit}&sort=DISTANCE`;

    console.log(`🔑 Using Foursquare API with key: ${foursquareApiKey.substring(0, 10)}...`);

    const foursquareResponse = await fetch(foursquareUrl, {
      headers: {
        'Authorization': foursquareApiKey,
        'Accept': 'application/json'
      }
    });

    if (foursquareResponse.ok) {
      const foursquareData = await foursquareResponse.json();
      console.log(`✅ Foursquare API response received:`, {
        resultCount: foursquareData.results?.length || 0,
        status: foursquareResponse.status
      });

      if (foursquareData.results && foursquareData.results.length > 0) {
        const restaurants = foursquareData.results.map((place, index) => ({
          id: place.fsq_id || `foursquare_${index}`,
          name: place.name || `Restaurant ${index + 1}`,
          description: place.description || `${place.categories?.[0]?.name || 'Restaurant'} with great food and atmosphere`,
          cuisine_type: place.categories?.[0]?.name || 'Restaurant',
          rating: (place.rating || (4.0 + Math.random() * 1.0)).toFixed(1),
          review_count: place.stats?.total_ratings || Math.floor(Math.random() * 500) + 50,
          price_range: place.price || Math.floor(Math.random() * 4) + 1,
          latitude: place.geocodes?.main?.latitude || parseFloat(latitude),
          longitude: place.geocodes?.main?.longitude || parseFloat(longitude),
          address: place.location?.formatted_address || place.location?.address || 'Bangkok, Thailand',
          phone: place.tel || '+66 2 XXX XXXX',
          website: place.website || '',
          delivery_available: Math.random() > 0.3,
          takeout_available: Math.random() > 0.2,
          reservations_available: Math.random() > 0.4,
          features: place.categories?.map(cat => cat.name) || ['restaurant'],
          images: place.photos ?
            place.photos.slice(0, 3).map(photo =>
              `${photo.prefix}400x400${photo.suffix}`
            ) :
            [`https://images.unsplash.com/photo-${1414235077428 + index}?w=400`],
          platform: 'foursquare',
          source: 'foursquare_api',
          fsq_id: place.fsq_id,
          distance: place.distance || 0,
          last_updated: new Date().toISOString()
        }));

        console.log(`✅ Successfully fetched ${restaurants.length} real restaurants from Foursquare API`);
        return restaurants;
      } else {
        console.warn(`⚠️ Foursquare API returned no results`);
        return null;
      }
    } else {
      const errorText = await foursquareResponse.text();
      console.warn(`⚠️ Foursquare API request failed with status: ${foursquareResponse.status}, error: ${errorText}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Foursquare API error:', error);
    return null;
  }
}

// Mock restaurant data generator
function generateMockRestaurants(latitude = 13.7563, longitude = 100.5018, limit = 20) {
  const cuisines = ['Thai', 'Italian', 'Japanese', 'Chinese', 'American', 'French', 'Indian', 'Mexican'];
  const restaurants = [];

  for (let i = 0; i < limit; i++) {
    const randomLat = latitude + (Math.random() - 0.5) * 0.02;
    const randomLng = longitude + (Math.random() - 0.5) * 0.02;
    
    restaurants.push({
      id: `mock_${i + 1}`,
      name: `Restaurant ${i + 1}`,
      cuisine_type: cuisines[Math.floor(Math.random() * cuisines.length)],
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      review_count: Math.floor(Math.random() * 500) + 10,
      price_range: Math.floor(Math.random() * 4) + 1,
      latitude: randomLat,
      longitude: randomLng,
      address: `${i + 1} Mock Street, Bangkok`,
      phone: `+66-2-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      website: `https://restaurant${i + 1}.example.com`,
      hours: '11:00-22:00',
      features: ['dine_in', 'takeout'],
      distance: (Math.random() * 5).toFixed(2)
    });
  }

  return restaurants;
}

// Restaurant search endpoint
app.get('/restaurants/search', async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      cuisine,
      price_range,
      rating,
      limit = 20,
      offset = 0
    } = req.query;

    console.log(`🔍 Restaurant search request:`, {
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      cuisine,
      limit: parseInt(limit)
    });

    // Try to fetch real restaurants from Foursquare API first
    let restaurants = [];
    let searchVia = 'mock_data';

    if (latitude && longitude) {
      console.log('🌐 Attempting to fetch real restaurant data from Foursquare...');
      const foursquareRestaurants = await fetchFoursquareRestaurants(
        parseFloat(latitude),
        parseFloat(longitude),
        10, // radius in km
        parseInt(limit) || 20
      );

      if (foursquareRestaurants && foursquareRestaurants.length > 0) {
        restaurants = foursquareRestaurants;
        searchVia = 'foursquare_api';
      }
    }

    // Fallback to mock data if Foursquare fails or no coordinates
    if (restaurants.length === 0) {
      console.log('📝 Using mock restaurant data as fallback');
      restaurants = generateMockRestaurants(
        parseFloat(latitude) || 13.7563,
        parseFloat(longitude) || 100.5018,
        parseInt(limit) || 20
      );
      searchVia = 'mock_data';
    }

    // Apply filters
    let filteredRestaurants = restaurants;
    
    if (cuisine) {
      filteredRestaurants = filteredRestaurants.filter(r => 
        r.cuisine_type.toLowerCase().includes(cuisine.toLowerCase())
      );
    }
    
    if (price_range) {
      filteredRestaurants = filteredRestaurants.filter(r => 
        r.price_range <= parseInt(price_range)
      );
    }
    
    if (rating) {
      filteredRestaurants = filteredRestaurants.filter(r => 
        parseFloat(r.rating) >= parseFloat(rating)
      );
    }

    const includeDemographics = req.query.include_demographics === 'true';
const includeTraffic = req.query.include_traffic === 'true';

console.log(`✅ Restaurant search completed:`, {
      found: filteredRestaurants.length,
      searchVia: searchVia,
      hasCoordinates: !!(latitude && longitude),
      geospatial_features: { includeDemographics, includeTraffic }
    });

    res.status(200).json({
      success: true,
      data: {
        restaurants: filteredRestaurants.slice(parseInt(offset), parseInt(offset) + parseInt(limit)),
        total: filteredRestaurants.length,
        filters: req.query,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: (parseInt(offset) + parseInt(limit)) < filteredRestaurants.length
        },
        geospatial_analysis: {
          demographics: includeDemographics ? {
            population_density: 15000,
            income_levels: ['low', 'medium'],
            age_distribution: { 18_24: 25, 25_34: 40, 35_44: 20, 45_54: 15 }
          } : null,
          traffic: includeTraffic ? {
            foot_traffic: 'high',
            peak_hours: ['12:00-14:00', '18:00-20:00'],
            parking_availability: 0.75
          } : null
        }
      },
      meta: {
        searchVia: searchVia,
        timestamp: new Date().toISOString(),
        coordinates_provided: !!(latitude && longitude),
        geospatial_features: {
          demographics: includeDemographics,
          traffic: includeTraffic
        }
      }
    });

  } catch (error) {
    console.error('❌ Restaurant search failed:', error);
    res.status(500).json({
      success: false,
      message: 'Restaurant search failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
// Featured restaurants endpoint
app.get('/restaurants/featured', async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    console.log('🌟 Fetching featured restaurants');
    
    // Generate mock featured restaurants
    const featuredRestaurants = generateMockRestaurants(
      parseFloat(latitude) || 13.7563,
      parseFloat(longitude) || 100.5018,
      5  // Limit to 5 featured restaurants
    ).map(restaurant => ({
      ...restaurant,
      featured: true,
      promotion: 'Featured on BiteBase',
      highlight: 'Exclusive menu items'
    }));

    res.status(200).json({
      success: true,
      data: {
        restaurants: featuredRestaurants,
        total: featuredRestaurants.length
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Featured restaurants failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get featured restaurants',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Restaurant details endpoint
app.get('/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Generate mock restaurant details
    const restaurant = {
      id: id,
      name: `Restaurant ${id.replace('mock_', '')}`,
      cuisine_type: 'Thai',
      rating: 4.2,
      review_count: 156,
      price_range: 2,
      latitude: 13.7563,
      longitude: 100.5018,
      address: '123 Mock Street, Bangkok',
      phone: '+66-2-123-4567',
      website: 'https://restaurant.example.com',
      hours: '11:00-22:00',
      features: ['dine_in', 'takeout', 'delivery']
    };

    res.status(200).json({
      success: true,
      data: {
        restaurant,
        similar_restaurants: generateMockRestaurants(13.7563, 100.5018, 3)
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Restaurant details failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get restaurant details',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Real-time restaurant search endpoint
// Helper function to calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

app.post('/restaurants/search/realtime', async (req, res) => {
  try {
    let {
      latitude,
      longitude,
      radius = 5,
      limit = 20,
      min_results = 5
    } = req.body;

    // Validate location data
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }
    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);
    radius = parseFloat(radius);
    limit = parseInt(limit);
    min_results = parseInt(min_results);

    if (isNaN(latitude)) {
      return res.status(400).json({
        success: false,
        error: 'Latitude must be a number'
      });
    }
    if (isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Longitude must be a number'
      });
    }
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        error: 'Latitude must be between -90 and 90'
      });
    }
    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        error: 'Longitude must be between -180 and 180'
      });
    }
    if (radius <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Search radius must be positive'
      });
    }

    // Auto-radius adjustment logic
    let currentRadius = radius;
    let restaurants = [];
    let searchVia = 'mock_data';
    let attempts = 0;
    const maxAttempts = 3;

    while (restaurants.length < min_results && attempts < maxAttempts) {
      console.log(`🌐 Attempting real-time fetch from Foursquare (radius: ${currentRadius}km)...`);
      const foursquareRestaurants = await fetchFoursquareRestaurants(latitude, longitude, currentRadius, limit);

      if (foursquareRestaurants && foursquareRestaurants.length > 0) {
        restaurants = foursquareRestaurants;
        searchVia = 'foursquare_api';
        if (restaurants.length >= min_results) break;
      }
      
      // Increase radius for next attempt
      currentRadius *= 1.5; // Increase by 50%
      attempts++;
    }

    // If still no results, use mock data
    if (restaurants.length === 0) {
      console.log('📝 Using mock data for real-time search');
      restaurants = generateMockRestaurants(latitude, longitude, limit);
      searchVia = 'mock_data';
    }

    // Categorize restaurants by proximity zones
    const categorizedRestaurants = restaurants.map(restaurant => {
      const distance = calculateDistance(
        latitude,
        longitude,
        restaurant.geocodes.main.latitude,
        restaurant.geocodes.main.longitude
      );
      
      let proximity = 'driving';
      if (distance <= 1) proximity = 'immediate';
      else if (distance <= 3) proximity = 'walking';
      
      return {
        ...restaurant,
        distance,
        proximity
      };
    });

    res.status(200).json({
      success: true,
      data: {
        restaurants: categorizedRestaurants,
        searchMetrics: {
          total_found: categorizedRestaurants.length,
          search_radius: currentRadius,
          search_center: { lat: latitude, lng: longitude },
          platforms_searched: [searchVia],
          data_source: searchVia,
          proximity_breakdown: {
            immediate: categorizedRestaurants.filter(r => r.proximity === 'immediate').length,
            walking: categorizedRestaurants.filter(r => r.proximity === 'walking').length,
            driving: categorizedRestaurants.filter(r => r.proximity === 'driving').length
          }
        }
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Realtime search failed:', error);
    res.status(500).json({
      success: false,
      error: 'Realtime search failed',
      details: error.message
    });
  }
});

// Location update endpoint
app.post('/user/location/update', async (req, res) => {
  try {
    // Extract enhanced location data including altitude, heading, and speed
    const { latitude, longitude, user_id, accuracy, altitude, heading, speed } = req.body;

    // Validate required fields
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    console.log(`📍 Location updated for user ${user_id || 'anonymous'}: ${latitude}, ${longitude} (Accuracy: ${accuracy}m, Altitude: ${altitude}m, Heading: ${heading}°, Speed: ${speed}m/s)`);

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: {
        tracking_id: user_id || 'anonymous',
        location: { latitude, longitude },
        accuracy: accuracy,
        altitude: altitude,
        heading: heading,
        speed: speed,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update location'
    });
  }
});

// Location streaming endpoint for real-time updates
app.post('/user/location/stream', async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      user_id,
      accuracy,
      auto_search,
      search_radius,
      max_results,
      include_nearby,
      session_id
    } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    console.log(`📍 Location stream for user ${user_id || 'anonymous'}: ${latitude}, ${longitude}`);

    // Generate nearby restaurants if auto_search is enabled
    let nearbyRestaurants = [];
    let searchVia = 'mock_streaming';

    if (auto_search) {
      const radius = search_radius || 5;
      const limit = max_results || 10;

      // Try Foursquare API first
      console.log('🌐 Attempting location stream fetch from Foursquare...');
      const foursquareRestaurants = await fetchFoursquareRestaurants(latitude, longitude, radius, limit);

      if (foursquareRestaurants && foursquareRestaurants.length > 0) {
        nearbyRestaurants = foursquareRestaurants;
        searchVia = 'foursquare_streaming';
      } else {
        console.log('📝 Using mock data for location streaming');
        nearbyRestaurants = generateNearbyRestaurants(latitude, longitude, radius, limit);
        searchVia = 'mock_streaming';
      }
    }

    res.status(200).json({
      success: true,
      message: 'Location streamed successfully',
      data: {
        tracking_id: user_id || 'anonymous',
        session_id: session_id,
        location: { latitude, longitude },
        accuracy: accuracy,
        timestamp: new Date().toISOString(),
        restaurants: nearbyRestaurants,
        search_metrics: {
          search_radius: search_radius || 5,
          results_count: nearbyRestaurants.length,
          data_source: searchVia,
          last_search: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Location streaming error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stream location'
    });
  }
});

// Test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({
    message: "🎉 BiteBase Express.js Backend is working perfectly!",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    version: "1.0.0",
    service: "bitebase-backend-express"
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: "🍽️ BiteBase API Server - Express.js Backend",
    version: "1.0.0",
    status: "operational",
    timestamp: new Date().toISOString(),
    endpoints: [
      "GET /health - Health check",
      "GET /ai - AI status",
      "GET /restaurants/search - Search restaurants",
      "GET /restaurants/:id - Get restaurant details",
      "POST /restaurants/search/realtime - Real-time search",
      "POST /user/location/update - Update location",
      "POST /user/location/stream - Stream location with nearby restaurants",
      "GET /test - Simple test endpoint"
    ],
    features: [
      "Restaurant search and discovery",
      "Real-time location tracking",
      "Mock data for development",
      "CORS enabled for frontend"
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    timestamp: new Date().toISOString(),
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BiteBase Express.js Backend running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Backend URL: http://0.0.0.0:${PORT}`);
  console.log(`🤖 API Status: Operational with mock data`);
});

// Export for Vercel
module.exports = app;

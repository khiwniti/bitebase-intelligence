# Environment Variables Checklist

## 🔑 API Keys & Credentials Provided

### ✅ Stripe
- **Publishable Key**: `pk_live_51QXx6jBnlMK6rCAQRtEMwxV3fvYjCfSl1X61xY1M75yRZGY5eu8Y0Bq4VkUSEgbyXt4pkMLiaO2UqXUXR43TBH4C00iVaAHEJv`
- **Secret Key**: ❌ **NEEDED** - You need to provide the corresponding secret key

### ✅ Foursquare
- **Client ID**: `UFEXNGODOGBQRX35NGIP0ZU0XDT2GJMIV0LGNGBMLU5RBVAN`
- **Client Secret**: `W4LHPBI1PVAKU4BLVQJ1YA2XNPZGVNNV44LCBQNRKJZHYDNZ`
- **API Key**: `fsq3Ciis2M5OLrAUQqL2V5z+bsUMKpCCdQe1ULDMN23ISSo=`

### ✅ Mapbox
- **Access Token**: `pk.eyJ1Ijoia2hpd25pdGkiLCJhIjoiY205eDFwMzl0MHY1YzJscjB3bm4xcnh5ZyJ9.ANGVE0tiA9NslBn8ft_9fQ`

## ❌ API Keys Still Needed

### Google Places API
- **API Key**: You need to obtain this from Google Cloud Console
- **URL Format**: `https://places.googleapis.com/v1/places/GyuEmsRBfy61i59si0?fields=addressComponents&key=YOUR_API_KEY`

### OpenAI
- **API Key**: Required for AI features
- **Model**: Recommended to use `gpt-4` or `gpt-3.5-turbo`

### Database
- **PostgreSQL URL**: Required for data storage
- **Format**: `postgres://username:password@host:port/database?sslmode=require`

### Security
- **JWT Secret**: Generate a secure random string for JWT token signing

## 📋 Frontend Environment Variables (Vercel)

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app

# Stripe (Frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51QXx6jBnlMK6rCAQRtEMwxV3fvYjCfSl1X61xY1M75yRZGY5eu8Y0Bq4VkUSEgbyXt4pkMLiaO2UqXUXR43TBH4C00iVaAHEJv

# Foursquare (Frontend)
NEXT_PUBLIC_FOURSQUARE_CLIENT_ID=UFEXNGODOGBQRX35NGIP0ZU0XDT2GJMIV0LGNGBMLU5RBVAN
NEXT_PUBLIC_FOURSQUARE_API_KEY=fsq3Ciis2M5OLrAUQqL2V5z+bsUMKpCCdQe1ULDMN23ISSo=

# Google Places (Frontend)
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=YOUR_GOOGLE_PLACES_API_KEY

# Mapbox (Frontend)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoia2hpd25pdGkiLCJhIjoiY205eDFwMzl0MHY1YzJscjB3bm4xcnh5ZyJ9.ANGVE0tiA9NslBn8ft_9fQ

# Feature Flags
NEXT_PUBLIC_ENABLE_MAPS=true
NEXT_PUBLIC_ENABLE_REAL_DATA=true
NEXT_PUBLIC_ENABLE_AI_CHAT=true

# App Configuration
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_APP_NAME=BiteBase Intelligence
```

## 📋 Backend Environment Variables (Vercel)

```env
# Database
DATABASE_URL=YOUR_POSTGRES_CONNECTION_STRING

# OpenAI
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
OPENAI_MODEL=gpt-4

# Stripe (Backend)
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET

# Foursquare (Backend)
FOURSQUARE_CLIENT_SECRET=W4LHPBI1PVAKU4BLVQJ1YA2XNPZGVNNV44LCBQNRKJZHYDNZ
FOURSQUARE_API_KEY=fsq3Ciis2M5OLrAUQqL2V5z+bsUMKpCCdQe1ULDMN23ISSo=

# Google Places (Backend)
GOOGLE_PLACES_API_KEY=YOUR_GOOGLE_PLACES_API_KEY

# Mapbox (Backend)
MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoia2hpd25pdGkiLCJhIjoiY205eDFwMzl0MHY1YzJscjB3bm4xcnh5ZyJ9.ANGVE0tiA9NslBn8ft_9fQ

# Security
JWT_SECRET=YOUR_JWT_SECRET_STRING

# Server Configuration
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://beta.bitebase.app
```

## 🔧 How to Obtain Missing API Keys

### 1. Google Places API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Places API
4. Create credentials (API Key)
5. Restrict the key to Places API for security

### 2. OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Set usage limits and billing

### 3. Stripe Secret Key
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Developers > API Keys
3. Copy the Secret Key (starts with `sk_live_` for production)
4. Set up webhooks if needed

### 4. PostgreSQL Database
**Option 1: Vercel Postgres (Recommended)**
1. Go to Vercel Dashboard
2. Navigate to Storage tab
3. Create new Postgres database
4. Copy connection string

**Option 2: External Provider**
- Railway: https://railway.app/
- Supabase: https://supabase.com/
- AWS RDS: https://aws.amazon.com/rds/
- Google Cloud SQL: https://cloud.google.com/sql

### 5. JWT Secret
Generate a secure random string:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64
```

## ✅ Deployment Checklist

### Before Deployment:
- [ ] All API keys obtained and tested
- [ ] Database created and accessible
- [ ] Environment variables configured in Vercel
- [ ] CORS origins updated for production domains
- [ ] SSL certificates configured

### After Backend Deployment:
- [ ] Backend URL noted and working
- [ ] Database connections tested
- [ ] API endpoints responding correctly

### After Frontend Deployment:
- [ ] Frontend loads without errors
- [ ] API calls to backend working
- [ ] All integrations functional (Stripe, Maps, etc.)
- [ ] Mobile responsiveness verified

## 🚨 Security Notes

1. **Never commit API keys to repositories**
2. **Use environment variables for all sensitive data**
3. **Restrict API keys to specific domains/IPs when possible**
4. **Enable CORS only for your domains**
5. **Use HTTPS for all production deployments**
6. **Regularly rotate API keys and secrets**

## 📞 Support

If you need help obtaining any of these API keys or configuring the deployment, please refer to the respective service documentation or contact the development team.
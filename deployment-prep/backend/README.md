# BiteBase Intelligence - Backend

Express.js 5.1.0 API server for the BiteBase Intelligence platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Start production server
npm start
```

## 🌐 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL=postgres://...
OPENAI_API_KEY=...
STRIPE_SECRET_KEY=...
FOURSQUARE_CLIENT_SECRET=...
FOURSQUARE_API_KEY=...
GOOGLE_PLACES_API_KEY=...
MAPBOX_ACCESS_TOKEN=...
JWT_SECRET=...
```

## 📦 Deployment

This API is configured for Vercel deployment. See `DEPLOYMENT.md` for detailed instructions.

## 🔧 Tech Stack

- Express.js 5.1.0
- Node.js 18+
- PostgreSQL
- OpenAI API
- Stripe
- Mapbox SDK

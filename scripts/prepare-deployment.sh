#!/bin/bash

# BiteBase Intelligence - Deployment Preparation Script
# This script helps prepare files for deployment to separate repositories

set -e

echo "🚀 BiteBase Intelligence - Deployment Preparation"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    print_error "Please run this script from the root of the bitebase-intelligence repository"
    exit 1
fi

# Create deployment directories
DEPLOY_DIR="./deployment-prep"
FRONTEND_DIR="$DEPLOY_DIR/frontend"
BACKEND_DIR="$DEPLOY_DIR/backend"

print_info "Creating deployment directories..."
mkdir -p "$FRONTEND_DIR"
mkdir -p "$BACKEND_DIR"

# Copy frontend files
print_info "Preparing frontend files..."
cp -r apps/frontend/* "$FRONTEND_DIR/"
cp -r apps/frontend/.* "$FRONTEND_DIR/" 2>/dev/null || true

# Copy backend files
print_info "Preparing backend files..."
cp -r apps/backend/* "$BACKEND_DIR/"
cp -r apps/backend/.* "$BACKEND_DIR/" 2>/dev/null || true

# Copy shared documentation
print_info "Copying documentation..."
cp README.md "$FRONTEND_DIR/"
cp README.md "$BACKEND_DIR/"
cp DEPLOYMENT.md "$FRONTEND_DIR/"
cp DEPLOYMENT.md "$BACKEND_DIR/"

# Create frontend-specific README
cat > "$FRONTEND_DIR/README.md" << 'EOF'
# BiteBase Intelligence - Frontend

Next.js 15.3.4 application for the BiteBase Intelligence platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_FOURSQUARE_CLIENT_ID=...
NEXT_PUBLIC_FOURSQUARE_API_KEY=...
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=...
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=...
```

## 📦 Deployment

This app is configured for Vercel deployment. See `DEPLOYMENT.md` for detailed instructions.

## 🔧 Tech Stack

- Next.js 15.3.4
- React 18
- Tailwind CSS
- Radix UI
- TypeScript
- Stripe
- Mapbox/Leaflet
EOF

# Create backend-specific README
cat > "$BACKEND_DIR/README.md" << 'EOF'
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
EOF

# Create deployment instructions
cat > "$DEPLOY_DIR/INSTRUCTIONS.md" << 'EOF'
# Deployment Instructions

## 1. Frontend Repository Setup

```bash
# Navigate to frontend directory
cd frontend

# Initialize git repository
git init
git add .
git commit -m "Initial commit - BiteBase Intelligence Frontend"

# Add remote repository
git remote add origin https://github.com/khiwniti/beta-bitebase-app.git

# Push to repository
git branch -M main
git push -u origin main
```

## 2. Backend Repository Setup

```bash
# Navigate to backend directory
cd backend

# Initialize git repository
git init
git add .
git commit -m "Initial commit - BiteBase Intelligence Backend"

# Add remote repository
git remote add origin https://github.com/khiwniti/bitebase-backend-express.git

# Push to repository
git branch -M main
git push -u origin main
```

## 3. Deploy to Vercel

### Backend First:
1. Connect backend repository to Vercel
2. Configure environment variables
3. Deploy and note the URL

### Frontend Second:
1. Connect frontend repository to Vercel
2. Configure environment variables (including backend URL)
3. Deploy

See DEPLOYMENT.md for detailed configuration instructions.
EOF

print_status "Frontend files prepared in: $FRONTEND_DIR"
print_status "Backend files prepared in: $BACKEND_DIR"
print_status "Instructions created in: $DEPLOY_DIR/INSTRUCTIONS.md"

print_info ""
print_info "Next steps:"
print_info "1. Review the prepared files in $DEPLOY_DIR"
print_info "2. Follow the instructions in $DEPLOY_DIR/INSTRUCTIONS.md"
print_info "3. Configure environment variables as described in DEPLOYMENT.md"
print_info "4. Deploy backend first, then frontend"

print_warning ""
print_warning "Important reminders:"
print_warning "- Deploy backend BEFORE frontend"
print_warning "- Configure all environment variables in Vercel"
print_warning "- Update API URLs after backend deployment"
print_warning "- Test all integrations after deployment"

echo ""
print_status "Deployment preparation complete! 🎉"
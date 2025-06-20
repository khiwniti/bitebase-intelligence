#!/bin/bash

# Staging environment startup script
echo "🎭 Starting BiteBase Intelligence in Staging Mode..."

# Load staging environment
export NODE_ENV=staging

# Check if .env.staging exists
if [ ! -f .env.staging ]; then
    echo "⚠️  .env.staging not found. Creating from example..."
    cp .env.example .env.staging
    echo "📝 Please update .env.staging with staging-specific values"
fi

# Start all applications in staging mode
echo "📦 Installing dependencies..."
yarn install

echo "🏗️  Building applications..."
yarn build

echo "🎭 Starting staging servers..."
yarn staging:all

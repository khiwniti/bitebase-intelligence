#!/bin/bash

# Development environment startup script
echo "🚀 Starting BiteBase Intelligence in Development Mode..."

# Load development environment
export NODE_ENV=development

# Check if .env.development exists
if [ ! -f .env.development ]; then
    echo "⚠️  .env.development not found. Creating from example..."
    cp .env.example .env.development
fi

# Start all applications in development mode
echo "📦 Installing dependencies..."
yarn install

echo "🏗️  Building applications..."
yarn build

echo "🔥 Starting development servers..."
yarn dev:all

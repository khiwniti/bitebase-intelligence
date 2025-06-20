#!/bin/bash

# Setup script for BiteBase Intelligence Turborepo with Yarn
echo "🚀 Setting up BiteBase Intelligence Turborepo..."

# Check if Yarn is installed
if ! command -v yarn &> /dev/null; then
    echo "❌ Yarn is not installed. Please install Yarn first:"
    echo "   npm install -g yarn"
    echo "   or visit: https://yarnpkg.com/getting-started/install"
    exit 1
fi

echo "✅ Yarn found: $(yarn --version)"

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to Node.js >= 18"
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Create environment files if they don't exist
if [ ! -f .env.development ]; then
    echo "📝 Creating .env.development from example..."
    cp .env.example .env.development
fi

if [ ! -f .env.staging ]; then
    echo "📝 Creating .env.staging from example..."
    cp .env.example .env.staging
fi

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Build all applications
echo "🏗️  Building applications..."
yarn build

echo "✅ Setup complete! You can now run:"
echo "   yarn dev:all      # Start development servers"
echo "   yarn staging:all  # Start staging servers"
echo "   yarn start:all    # Start production servers"

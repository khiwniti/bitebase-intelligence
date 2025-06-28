# BiteBase Intelligence - Turborepo Monorepo

A unified monorepo for BiteBase Intelligence platform, managing both frontend and backend applications using Turborepo.

## 🏗️ Project Structure

```
bitebase-intelligence/
├── apps/
│   ├── frontend/          # Next.js frontend application
│   └── backend/           # Express.js backend API
├── packages/              # Shared packages (future)
├── .env.development       # Development environment variables
├── .env.staging          # Staging environment variables
├── .env.example          # Environment variables template
├── package.json          # Root package.json with workspace configuration
├── turbo.json           # Turborepo configuration
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- Yarn >= 1.22.0

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd bitebase-intelligence

# Install dependencies for all apps
yarn install

# Build all applications
yarn build
```

## 🛠️ Development Commands

### Run All Applications
```bash
# Development mode (both frontend and backend)
yarn dev

# Staging mode (both frontend and backend)
yarn staging:all

# Production mode (both frontend and backend)
yarn start:all
```

### Run Individual Applications
```bash
# Frontend only
yarn dev:frontend      # Development
yarn staging:frontend  # Staging
yarn start:frontend    # Production

# Backend only
yarn dev:backend       # Development
yarn staging:backend   # Staging
yarn start:backend     # Production
```

### Other Commands
```bash
# Linting
yarn lint

# Type checking
yarn check-types

# Testing
yarn test

# Code formatting
yarn format

# Clean build artifacts
yarn clean

# Install all dependencies
yarn install:all

# Clean everything including node_modules
yarn clean:all
```

## 🌍 Environment Configuration

### Development Environment
- Frontend: http://localhost:12000
- Backend: http://localhost:3001
- Uses `.env.development` configuration

### Staging Environment
- Frontend: http://localhost:12001 (or staging URL)
- Backend: http://localhost:3001 (or staging URL)
- Uses `.env.staging` configuration

### Environment Setup
1. Copy `.env.example` to `.env.local`
2. Update the variables according to your environment
3. Each app can have its own `.env.local` file for app-specific variables

## 📦 Applications

### Frontend (`apps/frontend`)
- **Framework**: Next.js 15
- **Port**: 12000 (dev), 12001 (staging)
- **Features**: Restaurant intelligence platform UI

### Backend (`apps/backend`)
- **Framework**: Express.js
- **Port**: 3001
- **Features**: REST API for restaurant data and AI intelligence

## 🔧 Turborepo Configuration

The monorepo uses Turborepo for:
- **Parallel execution**: Run multiple apps simultaneously
- **Caching**: Intelligent build and test caching
- **Pipeline management**: Dependency-aware task execution
- **Environment isolation**: Separate configurations per environment

## 📝 Adding New Applications

1. Create a new directory under `apps/`
2. Add the app to the `workspaces` array in root `package.json`
3. Update `turbo.json` pipeline if needed
4. Add app-specific scripts to root `package.json`

## 🚀 Deployment

Each application can be deployed independently:
- Frontend: Vercel, Netlify, or any static hosting
- Backend: Vercel, Railway, Heroku, or any Node.js hosting

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm run test`
4. Run linting: `npm run lint`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

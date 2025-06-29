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

# Build all applications
yarn build

# Start all applications in production mode
yarn start

# Run staging environment
yarn staging
```

### Individual Application Commands
```bash
# Frontend only (from apps/frontend)
cd apps/frontend
yarn dev          # Development
yarn build        # Build
yarn start        # Production

# Backend only (from apps/backend)
cd apps/backend
yarn dev          # Development
yarn start        # Production
```

### Other Commands
```bash
# Linting
yarn lint

# Type checking
yarn check-types

# Testing
yarn test

# Clean build artifacts
yarn clean

# Legacy development command (concurrently)
yarn start:dev
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
- **Framework**: Next.js 15.3.4
- **UI Library**: Radix UI + Tailwind CSS
- **Port**: 12000 (dev), 12001 (staging)
- **Features**: Restaurant intelligence platform UI with modern React components

### Backend (`apps/backend`)
- **Framework**: Express.js 5.1.0
- **Database**: PostgreSQL
- **AI Integration**: OpenAI API
- **Port**: 3001
- **Features**: REST API for restaurant data, geospatial queries, and AI intelligence

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

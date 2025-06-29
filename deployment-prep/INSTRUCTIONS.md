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

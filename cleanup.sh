#!/bin/bash

# Setup colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo "${GREEN}Starting cleanup for Railway deployment...${NC}"

# 1. Remove test files
echo "${YELLOW}Removing test files...${NC}"
rm -f api-test.sh
rm -f backend-test.js
rm -f fix-*.sh
rm -f fix-*.js
rm -f *test*.js
rm -f *test*.html
rm -f run_test.sh
rm -f serve-test-page.sh
rm -f websocket-debug.js
rm -f websocket-test.html
rm -f github_setup.sh
rm -f login-test.html
rm -f simple-login.html

# 2. Make sure .gitignore includes node_modules and sensitive files
echo "${YELLOW}Updating .gitignore...${NC}"
cat > .gitignore << EOL
# dependencies
node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build
/frontend/build
/backend/build

# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.development
.env.test
**/.DS_Store

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
logs
*.log

# editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Backups
mongo-backups/*
!mongo-backups/.gitkeep
EOL

# 3. Create .gitkeep for mongo-backups to preserve directory
mkdir -p mongo-backups
touch mongo-backups/.gitkeep

# 4. Organize documentation
echo "${YELLOW}Organizing documentation...${NC}"
mkdir -p docs
mv *.md docs/ 2>/dev/null
# Move back essential README
mv docs/README.md . 2>/dev/null
# Keep the CODE-SPLITTING documentation at root since it's important for the current state
mv docs/CODE-SPLITTING.md . 2>/dev/null

# 5. Ensure setup.sh and start.sh are executable
echo "${YELLOW}Making scripts executable...${NC}"
chmod +x setup.sh
chmod +x start.sh
if [ -d "scripts" ]; then
  chmod +x scripts/*.sh
fi

# 6. Create a deployment guide for Railway
echo "${YELLOW}Creating Railway deployment guide...${NC}"
cat > RAILWAY-DEPLOYMENT.md << EOL
# Deploying to Railway

This guide explains how to deploy the Solar ERP application to Railway.

## Prerequisites

1. A Railway account (sign up at [railway.app](https://railway.app))
2. Railway CLI installed (optional but recommended)
3. Git repository for your project

## Deployment Steps

### 1. Prepare your project

Make sure your project is ready for deployment:
- MongoDB connection string is configurable via environment variables
- All sensitive data is moved to environment variables
- The application listens on the PORT provided by Railway

### 2. Deploy via Railway Dashboard

1. Log in to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Configure the environment variables:
   - NODE_ENV=production
   - PORT=\$PORT (Railway will provide this)
   - MONGO_URI=your-mongodb-uri
   - JWT_SECRET=your-jwt-secret
   - REDIS_URI=your-redis-uri (if using Redis)
   - REDIS_PASSWORD=your-redis-password (if using Redis)
5. Deploy the project

### 3. Add MongoDB Service

1. In your project dashboard, click "New" → "Database" → "MongoDB"
2. Once provisioned, go to the "Variables" tab to get the connection URI
3. Update your application's MONGO_URI with this value

### 4. Add Redis Service (Optional)

1. In your project dashboard, click "New" → "Database" → "Redis"
2. Once provisioned, go to the "Variables" tab to get the connection URI
3. Update your application's REDIS_URI with this value

### 5. Configure Domain (Optional)

1. In your project dashboard, go to the "Settings" tab
2. Under "Domains", click "Generate Domain" or add a custom domain

## Troubleshooting

If your deployment fails:

1. Check the logs in the Railway dashboard
2. Verify all required environment variables are set
3. Ensure your application listens on the PORT provided by Railway
4. Check that your package.json has the correct start script

## Monitoring

Railway provides basic monitoring:

1. Go to the "Metrics" tab to view CPU, memory, and disk usage
2. Check the "Logs" tab for application logs
EOL

echo "${GREEN}Cleanup completed! Your project is now ready for Railway deployment.${NC}"
echo "${GREEN}See RAILWAY-DEPLOYMENT.md for deployment instructions.${NC}"

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
   - PORT=$PORT (Railway will provide this)
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

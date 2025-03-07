# Deploying Solar ERP to Railway

This guide provides step-by-step instructions for deploying the Solar ERP application to Railway.

## Prerequisites

1. [Railway Account](https://railway.app) - You'll need an account on Railway
2. [GitHub Repository](https://github.com) - Your code should be in a GitHub repository
3. [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas) - For database hosting (or use Railway's MongoDB service)

## Step 1: Clean Up the Project

Run the cleanup script to remove unnecessary files and prepare the project for deployment:

```bash
chmod +x cleanup.sh
./cleanup.sh
```

## Step 2: Prepare Your MongoDB Database

### Option A: Use Railway's MongoDB Service

1. Create a new project in Railway
2. Click on "New" → "Database" → "MongoDB"
3. Railway will provision a MongoDB instance for you
4. Get the connection string from the "Connect" tab

### Option B: Use MongoDB Atlas

1. Create a cluster in [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Set up a database user with password
3. Get the connection string from Atlas

## Step 3: Configure Environment Variables

Create a `.env.production` file with the following configuration (replace placeholders with your actual values):

```
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret-key
MONGO_URI=your-mongodb-connection-string
```

## Step 4: Deploy to Railway

### Using the Railway CLI

1. Install the Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Initialize the project:
   ```bash
   railway init
   ```

4. Link to an existing project or create a new one:
   ```bash
   railway link
   ```

5. Add environment variables:
   ```bash
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=your-secure-jwt-secret
   railway variables set MONGO_URI=your-mongodb-connection-string
   ```

6. Deploy the application:
   ```bash
   railway up
   ```

### Using the Railway Dashboard

1. Visit [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your GitHub repository
4. Configure the following environment variables:
   - `NODE_ENV=production`
   - `JWT_SECRET=your-secure-jwt-secret`
   - `MONGO_URI=your-mongodb-connection-string`
5. Click "Deploy"

## Step 5: Set Up a Custom Domain (Optional)

1. In your Railway project dashboard, go to the "Settings" tab
2. Click on "Add Domain"
3. Enter your domain name and follow the instructions to configure DNS settings

## Step 6: Monitoring and Logs

- **View Logs**: Go to the "Deployments" tab and click on the latest deployment to view logs
- **Monitor Resources**: Check the "Metrics" tab to monitor CPU, memory, and storage usage

## Step 7: Database Management

### Option A: Using Railway's MongoDB Service

1. Go to the "Database" service in your Railway project
2. Click on "Connect" to get connection details
3. Use MongoDB Compass or similar tools to connect to your database

### Option B: Using MongoDB Atlas

1. Log in to MongoDB Atlas dashboard
2. Navigate to your cluster
3. Use MongoDB Atlas UI to manage your database

## Troubleshooting

### Common Issues and Solutions

1. **Deployment Fails**:
   - Check the deployment logs for specific errors
   - Ensure environment variables are correctly set
   - Verify your MongoDB connection string is correct

2. **Application Errors After Deployment**:
   - Check the application logs in the Railway dashboard
   - Verify that the MongoDB connection is working
   - Check if the JWT_SECRET is properly set

3. **WebSocket Connection Issues**:
   - Ensure the WebSocket service is correctly configured
   - Check browser console for any connection errors

## Notes for Future Updates

When updating your application:

1. Push changes to your GitHub repository
2. Railway will automatically detect the changes and deploy the updates
3. Monitor the deployment logs for any issues

## Backup Strategy

Implement a regular backup strategy for your MongoDB database:

1. For MongoDB Atlas: Set up automatic backups in the Atlas dashboard
2. For Railway MongoDB: Set up a scheduled job to dump the database and store backups externally

---

This deployment process has been optimized for Railway. If you need to deploy to other platforms, additional configuration may be required.

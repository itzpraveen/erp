# Data Persistence Implementation Guide

This guide documents the changes made to ensure all data is persisted properly in the ERP system.

## Current Implementation

We've updated the system to use MongoDB for all data storage instead of localStorage:

1. **MongoDB Database Configuration**:
   - Optimized MongoDB settings for performance and reliability
   - Added connection pooling and retry logic
   - Implemented proper error handling in database connections

2. **Data Model Improvements**:
   - Added indexes for better query performance
   - Created robust data schemas with validation
   - Implemented soft delete functionality

3. **API Services**:
   - Created full CRUD operations for Proposals through REST APIs
   - Implemented data filtering, pagination, and search
   - Added aggregate queries for metrics and statistics

4. **Frontend Integration**:
   - Updated frontend to use API endpoints instead of localStorage
   - Implemented Redux state management for Proposals
   - Added comprehensive error handling

## Known Issues Fixed

1. **500 Error Resolution**:
   - The initial implementation included Redis dependencies that weren't available
   - Removed Redis-related code and dependencies for now
   - Server now starts properly and handles requests without errors

## Future Enhancements

### Redis Integration 

When Redis is available, implement the following:

1. **Add Redis to docker-compose.yml**:
   ```yaml
   redis:
     image: redis:alpine
     container_name: erp-redis
     ports:
       - "6379:6379"
     volumes:
       - redis-data:/data
     restart: always
     networks:
       - erp-network
   ```

2. **Install Redis and related packages**:
   ```bash
   cd backend
   npm install redis connect-redis express-session
   ```

3. **Implement Redis in Server.js**:
   - Initialize Redis client
   - Set up session store with Redis
   - Enable caching middleware

4. **Implement Caching**:
   - Add caching for frequently accessed resources
   - Use Redis for real-time notifications
   - Store session data in Redis

### MongoDB Backups

A backup script has been prepared in `/scripts/backup.sh` that will:
1. Automatically back up MongoDB data
2. Compress backups to save space
3. Keep a rolling 7-day backup history

To enable it:
1. Add execute permission: `chmod +x scripts/backup.sh`
2. Add it to a cron job or enable the backup service in docker-compose

## Troubleshooting

If you encounter 500 errors:

1. Check MongoDB connection:
   ```bash
   docker logs mongodb
   ```

2. Ensure backend has correct environment variables:
   ```bash
   docker logs erp-backend
   ```

3. If Redis is enabled, check Redis connection:
   ```bash
   docker logs erp-redis
   ```

## Migration

To migrate data from localStorage to MongoDB:

1. Run the migration script:
   ```bash
   cd backend
   npm run migrate:local
   ```

2. Follow the prompts to transfer data from localStorage to MongoDB

## Best Practices

For proper data persistence:

1. Always use MongoDB for storing application data
2. Use proper error handling in all database operations
3. Implement transaction support for critical operations
4. Add appropriate indexes for frequently queried fields

When Redis is implemented:
1. Use Redis for caching, not as a primary database
2. Implement proper fallbacks if Redis is unavailable
3. Set appropriate TTL (Time To Live) for cached data
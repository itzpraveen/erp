# Solar ERP - Deployment Guide

This document outlines the steps to deploy the Solar ERP application in a production environment.

## Prerequisites

- Docker and Docker Compose installed on the server
- Domain name (for HTTPS)
- Basic understanding of Linux server administration

## Environment Setup

1. Clone the repository to your production server:
   ```bash
   git clone <your-repository-url>
   cd erp
   ```

2. Create a `.env` file based on the `.env.production` template:
   ```bash
   cp .env.production .env
   ```

3. Edit the `.env` file with your production values:
   ```
   # MongoDB Configuration
   MONGO_USER=your_secure_username
   MONGO_PASSWORD=your_secure_password
   MONGO_URI=mongodb://mongodb:27017/solar-erp

   # JWT Configuration
   JWT_SECRET=your_secure_random_string

   # Application Settings
   NODE_ENV=production
   PORT=5001
   ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

## SSL Certificate Setup

1. Create a directory for SSL certificates:
   ```bash
   mkdir -p nginx/ssl
   ```

2. If using Let's Encrypt, install certbot and obtain certificates:
   ```bash
   sudo apt-get update
   sudo apt-get install certbot
   sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
   ```

3. Copy certificates to your project:
   ```bash
   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
   ```

## Deployment

1. Build and start the production containers:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

2. Check if all containers are running:
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

## Database Setup

1. The first time you run the application, you need to create a MongoDB admin user:
   ```bash
   docker-compose -f docker-compose.prod.yml exec mongodb mongo admin
   ```

2. In the MongoDB shell, run:
   ```javascript
   db.createUser(
     {
       user: "your_mongo_user",
       pwd: "your_mongo_password",
       roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
     }
   )
   ```

## Monitoring and Maintenance

1. View container logs:
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f
   ```

2. Monitor specific container:
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f backend
   ```

3. Restart services:
   ```bash
   docker-compose -f docker-compose.prod.yml restart backend
   ```

## Backups

1. Set up a cron job to backup MongoDB:
   ```bash
   crontab -e
   ```

2. Add the following line to run daily at 2 AM:
   ```
   0 2 * * * docker exec mongodb mongodump --out /data/backup/$(date +"%Y-%m-%d") && tar -czf /backup/mongodb-$(date +"%Y-%m-%d").tar.gz /data/backup/$(date +"%Y-%m-%d") && rm -rf /data/backup/$(date +"%Y-%m-%d")
   ```

## Security Recommendations

1. Keep all software updated regularly
2. Use strong, unique passwords
3. Restrict SSH access with key-based authentication only
4. Set up a firewall to only allow necessary ports
5. Implement regular security audits
6. Enable database authentication
7. Set up monitoring and alerting
8. Keep regular backups

## Scaling Considerations

As the application grows, consider:

1. Implementing a load balancer
2. Setting up MongoDB replication
3. Using container orchestration like Kubernetes
4. Implementing a CDN for static assets

## Troubleshooting

If you encounter issues:

1. Check container logs for errors
2. Verify network connectivity between containers
3. Validate environment variable configuration
4. Check for disk space issues
5. Inspect Nginx error logs (in nginx/logs directory)

For more information or if you need assistance, please contact the development team.

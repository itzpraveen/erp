# Docker Setup Instructions

## Overview

This application is designed to run using Docker containers. This approach provides several benefits:

- Consistent environment across all development machines
- Easier setup with no need to install MongoDB separately
- Avoids port conflicts with locally running services
- Simplified deployment

## Using Docker

### Prerequisites

- Docker and Docker Compose must be installed on your system
- Make sure ports 5001 (API), 3002 (Frontend), and 27017 (MongoDB) are available

### Starting the Application

The easiest way to start the application is to use the provided script:

```bash
./start.sh
```

This script will:
1. Stop any existing containers
2. Start all required services (MongoDB, Backend API, Frontend)
3. Show the URLs to access the application

### Manual Docker Commands

If you prefer using Docker commands directly:

1. Start all services:
   ```bash
   docker-compose up -d
   ```

2. View logs:
   ```bash
   docker-compose logs -f          # All services
   docker-compose logs -f backend  # Just backend
   docker-compose logs -f frontend # Just frontend
   ```

3. Stop all services:
   ```bash
   docker-compose down
   ```

4. Reset everything (including database):
   ```bash
   docker-compose down -v
   ```

5. Import demo data:
   ```bash
   docker exec -it erp-backend npm run data:import
   ```

## Accessing the Application

- Frontend: http://localhost:3002
- Backend API: http://localhost:5001

## Troubleshooting

If you encounter issues:

1. Check if any non-Docker services are running on the required ports:
   ```bash
   lsof -i:5001   # Check if anything is using the API port
   lsof -i:3002   # Check if anything is using the frontend port
   lsof -i:27017  # Check if anything is using the MongoDB port
   ```

2. If ports are in use by non-Docker processes, stop them:
   ```bash
   lsof -i:5001 -t | xargs kill -9   # Force stop whatever is using port 5001
   ```

3. For persistent problems, try a full reset:
   ```bash
   docker-compose down -v  # Remove all containers and volumes
   docker-compose up -d    # Start fresh
   ```

4. Still having issues? Check the Docker logs:
   ```bash
   docker-compose logs
   ```

## Important Note

Do not attempt to run the backend or frontend directly on your machine while also running Docker containers. This will cause port conflicts and "500 Internal Server Error" messages.

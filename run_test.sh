#!/bin/bash

echo "Starting ERP application with MongoDB persistence..."

# Stop any running containers
docker-compose down

# Start the application
docker-compose up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 5

# Check if MongoDB is running
echo "Checking MongoDB status..."
docker logs mongodb | tail -n 10

# Check if backend is running
echo "Checking Backend API status..."
docker logs erp-backend | tail -n 10

# Check if frontend is running
echo "Checking Frontend status..."
docker logs erp-frontend | tail -n 10

echo ""
echo "Application is running!"
echo "Access the application at: http://localhost:3002"
echo ""
echo "To stop the application, run: docker-compose down"
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${GREEN}Solar Panel ERP System Startup Script${NC}"
echo -e "${BLUE}=======================================${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Stop any running containers first
echo -e "\n${YELLOW}Stopping any running containers...${NC}"
docker-compose down

# Start the containers
echo -e "\n${YELLOW}Starting the application with Docker...${NC}"
docker-compose up -d

echo -e "\n${GREEN}Waiting for services to be ready...${NC}"
sleep 10

# Check if the services are running
if [ "$(docker ps -q -f name=erp-backend)" ] && [ "$(docker ps -q -f name=erp-frontend)" ] && [ "$(docker ps -q -f name=mongodb)" ]; then
    echo -e "\n${GREEN}Application started successfully!${NC}"
    echo -e "${BLUE}=======================================${NC}"
    echo -e "${GREEN}Access the application at: ${BLUE}http://localhost:3002${NC}"
    echo -e "${GREEN}API available at: ${BLUE}http://localhost:5001${NC}"
    echo -e "${BLUE}=======================================${NC}"
    echo -e "${GREEN}Demo credentials:${NC}"
    echo -e "${YELLOW}Admin user:${NC} admin@example.com / password123"
    echo -e "${YELLOW}Sales user:${NC} sales@example.com / password123"
    echo -e "${BLUE}=======================================${NC}"
    
    # Ask if user wants to see logs
    echo -e "${YELLOW}Do you want to see the logs? (y/n)${NC}"
    read -r answer
    if [[ "$answer" =~ ^[Yy]$ ]]; then
        docker-compose logs -f
    fi
else
    echo -e "\n${RED}Some services failed to start. Checking logs...${NC}"
    docker-compose logs
fi

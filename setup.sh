#!/bin/bash

# Solar ERP Setup and Management Script
# This script helps manage the Solar ERP application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print header
print_header() {
    echo -e "\n${YELLOW}===== $1 =====${NC}\n"
}

# Development environment setup
setup_dev() {
    print_header "Setting up development environment"
    
    echo -e "${GREEN}Starting Docker containers...${NC}"
    docker-compose down
    docker-compose up -d
    
    echo -e "${GREEN}Installing backend dependencies...${NC}"
    docker-compose exec backend npm install
    
    echo -e "${GREEN}Installing frontend dependencies...${NC}"
    docker-compose exec frontend npm install
    
    echo -e "${GREEN}Development environment is ready!${NC}"
    echo -e "Backend: http://localhost:5001"
    echo -e "Frontend: http://localhost:3002"
}

# Production environment setup
setup_prod() {
    print_header "Setting up production environment"
    
    if [ ! -f .env.production ]; then
        echo -e "${RED}Error: .env.production file not found!${NC}"
        echo -e "Please create this file based on .env.production.example"
        exit 1
    fi
    
    echo -e "${GREEN}Building and starting production containers...${NC}"
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d --build
    
    echo -e "${GREEN}Production environment is ready!${NC}"
}

# Install missing packages
install_packages() {
    print_header "Installing missing packages"
    
    echo -e "${GREEN}Installing backend packages...${NC}"
    docker-compose exec backend npm install helmet express-rate-limit ws --save
    
    echo -e "${GREEN}Installing frontend packages...${NC}"
    docker-compose exec frontend npm install html2canvas jspdf ws --save
    
    echo -e "${GREEN}Restarting services...${NC}"
    docker-compose restart backend frontend
    
    echo -e "${GREEN}Packages installed successfully!${NC}"
}

# Backup database
backup_db() {
    print_header "Backing up MongoDB database"
    
    BACKUP_DIR="./backups"
    mkdir -p $BACKUP_DIR
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILENAME="solar-erp_backup_$TIMESTAMP.gz"
    
    echo -e "${GREEN}Creating database backup...${NC}"
    docker-compose exec mongodb mongodump --archive --gzip --db=solar-erp > "$BACKUP_DIR/$BACKUP_FILENAME"
    
    echo -e "${GREEN}Backup created: $BACKUP_DIR/$BACKUP_FILENAME${NC}"
}

# Show logs
show_logs() {
    print_header "Showing logs"
    
    if [ "$1" == "backend" ] || [ "$1" == "frontend" ] || [ "$1" == "mongodb" ]; then
        docker-compose logs --tail=100 -f $1
    else
        docker-compose logs --tail=50 -f
    fi
}

# Display help message
show_help() {
    echo -e "\n${YELLOW}Solar ERP Management Script${NC}"
    echo -e "\nUsage: $0 [command]"
    echo -e "\nCommands:"
    echo -e "  dev             Setup development environment"
    echo -e "  prod            Setup production environment"
    echo -e "  install         Install missing packages"
    echo -e "  backup          Backup the MongoDB database"
    echo -e "  logs [service]  Show logs (optional: backend, frontend, mongodb)"
    echo -e "  help            Show this help message"
}

# Main script execution
case "$1" in
    dev)
        setup_dev
        ;;
    prod)
        setup_prod
        ;;
    install)
        install_packages
        ;;
    backup)
        backup_db
        ;;
    logs)
        show_logs $2
        ;;
    help|*)
        show_help
        ;;
esac

exit 0

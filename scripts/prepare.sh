#!/bin/bash

# Make backup directory
mkdir -p backups

# Backup original files
cp backend/src/server.js backups/server.js.bak
cp backend/package.json backups/backend-package.json.bak
cp docker-compose.yml backups/docker-compose.yml.bak
cp docker-compose.prod.yml backups/docker-compose.prod.yml.bak

# Make scripts executable
chmod +x scripts/backup.sh
chmod +x setup.sh
chmod +x start.sh

# Create data directories
mkdir -p mongo-backups
mkdir -p backend/src/migrations/data

echo "Preparations complete."
echo "Run 'docker-compose down && docker-compose up -d' to apply the changes."
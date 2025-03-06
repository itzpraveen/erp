#!/bin/bash

# MongoDB backup script
# This script runs as a cron job to create daily backups

set -e

# Environment variables should be passed from docker-compose
MONGO_HOST=${MONGO_HOST:-mongodb}
MONGO_PORT=${MONGO_PORT:-27017}
MONGO_USER=${MONGO_USER:-admin}
MONGO_PASSWORD=${MONGO_PASSWORD}
MONGO_DB=${MONGO_DB:-solar-erp}
BACKUP_DIR=/backups

# Create backup directory with date
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_PATH="${BACKUP_DIR}/${DATE}"
mkdir -p ${BACKUP_PATH}

echo "Starting MongoDB backup at ${DATE}"

# Run mongodump
mongodump \
  --host=${MONGO_HOST} \
  --port=${MONGO_PORT} \
  --username=${MONGO_USER} \
  --password=${MONGO_PASSWORD} \
  --authenticationDatabase=admin \
  --db=${MONGO_DB} \
  --out=${BACKUP_PATH}

# Create a compressed archive
tar -czf ${BACKUP_PATH}.tar.gz -C ${BACKUP_DIR} ${DATE}

# Remove the uncompressed directory
rm -rf ${BACKUP_PATH}

# Keep only the last 7 backups
ls -t ${BACKUP_DIR}/*.tar.gz | tail -n +8 | xargs -r rm

echo "Backup completed successfully: ${BACKUP_PATH}.tar.gz"

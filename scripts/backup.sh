#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

echo "Creating database backup: gps_recruitment_$DATE.sql"
# Placeholder for pg_dump command
# pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/gps_recruitment_$DATE.sql

echo "Backup complete."

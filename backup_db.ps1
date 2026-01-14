$ErrorActionPreference = "Stop"

# Configuration
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_DIR = Join-Path $PSScriptRoot "backups"
$TARGET_BACKUP_PATH = Join-Path $BACKUP_DIR $TIMESTAMP
$CONTAINER_NAME = "storage-mongo"
$DB_NAME = "storage_db" # Backup specific DB, remove --db argument to backup all

# Create backup directory if it doesn't exist
if (-not (Test-Path -Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Force -Path $BACKUP_DIR | Out-Null
}

Write-Host "Starting MongoDB Backup for $CONTAINER_NAME..." -ForegroundColor Cyan

# 1. Dump database inside the container
# We dump to a temp folder inside the container first
Write-Host "dumping data inside container..."
docker exec $CONTAINER_NAME mongodump --out /dump_tmp

# 2. Copy dump from container to host
Write-Host "Copying dump to host..."
docker cp "${CONTAINER_NAME}:/dump_tmp/." $TARGET_BACKUP_PATH

# 3. Clean up inside container
Write-Host "Cleaning up container..."
docker exec $CONTAINER_NAME rm -rf /dump_tmp

Write-Host "Backup completed successfully!" -ForegroundColor Green
Write-Host "Location: $TARGET_BACKUP_PATH"

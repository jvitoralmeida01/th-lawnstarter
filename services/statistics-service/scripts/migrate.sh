#!/bin/sh

set -e

# Wait for database to be ready
sh /app/scripts/wait-for-db.sh

echo "Running database migrations..."

DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_DATABASE="${DB_DATABASE:-statistics}"
DB_USERNAME="${DB_USERNAME:-sw_user}"
DB_PASSWORD="${DB_PASSWORD:-sw_pass}"

export PGPASSWORD="${DB_PASSWORD}"

psql -h "${DB_HOST}" \
     -p "${DB_PORT}" \
     -U "${DB_USERNAME}" \
     -d "${DB_DATABASE}" \
     -f /app/database/migrations/001_create_tables.sql

echo "Migrations completed successfully!"


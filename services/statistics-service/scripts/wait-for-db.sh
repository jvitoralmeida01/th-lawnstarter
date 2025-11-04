#!/bin/sh

set -e

DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_DATABASE="${DB_DATABASE:-statistics}"
DB_USERNAME="${DB_USERNAME:-sw_user}"
DB_PASSWORD="${DB_PASSWORD:-sw_pass}"

MAX_RETRIES=30
RETRY_INTERVAL=2

export PGPASSWORD="${DB_PASSWORD}"

echo "Waiting for database to be ready..."

for i in $(seq 1 $MAX_RETRIES); do
  if pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USERNAME}" > /dev/null 2>&1; then
    echo "Database is ready!"

    # Try to connect to the specific database
    if psql -h "${DB_HOST}" \
            -p "${DB_PORT}" \
            -U "${DB_USERNAME}" \
            -d "${DB_DATABASE}" \
            -c "SELECT 1;" > /dev/null 2>&1; then
      echo "Successfully connected to database '${DB_DATABASE}'"
      exit 0
    else
      echo "Database is ready but cannot connect to database '${DB_DATABASE}', retrying... (${i}/${MAX_RETRIES})"
    fi
  else
    echo "Database is not ready yet, retrying... (${i}/${MAX_RETRIES})"
  fi

  if [ $i -lt $MAX_RETRIES ]; then
    sleep $RETRY_INTERVAL
  fi
done

echo "ERROR: Database did not become ready after $((MAX_RETRIES * RETRY_INTERVAL)) seconds"
exit 1


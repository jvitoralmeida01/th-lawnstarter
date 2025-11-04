#!/bin/bash
# Check the statistics service logs to see if messages were consumed

cd "$(dirname "$0")/.." || exit 1

echo "=== Recent Statistics Service Logs ==="
docker-compose logs --tail=50 statistics | grep -E "(Starting statistics|Processing|Successfully inserted|No events|query events)" || echo "No relevant log entries found"


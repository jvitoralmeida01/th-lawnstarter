#!/bin/bash
# Temporarily stop the statistics service, produce messages, and inspect the queue

cd "$(dirname "$0")/.." || exit 1

echo "=== Stopping statistics service temporarily ==="
docker-compose stop statistics

echo ""
echo "=== Producing test messages ==="
npm run produce

echo ""
echo "=== Waiting 2 seconds ==="
sleep 2

echo ""
echo "=== Inspecting queue ==="
npm run inspect-queue

echo ""
echo "=== Restarting statistics service ==="
docker-compose start statistics

echo ""
echo "Done! Messages should now be visible in the queue (until the service consumes them)"


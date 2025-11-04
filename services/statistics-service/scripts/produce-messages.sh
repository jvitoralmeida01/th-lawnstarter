#!/bin/bash
# Produce messages to RabbitMQ by running the script inside the Docker container

cd "$(dirname "$0")/.." || exit 1

# Check if container is running
if ! docker-compose ps statistics | grep -q "Up"; then
  echo "Error: statistics container is not running"
  echo "Please start it with: docker-compose up -d statistics"
  exit 1
fi

# Run the script inside the container
# Install tsx in an isolated temp location to avoid platform conflicts with host node_modules
# Pass arguments properly by building the command with escaped arguments
ARGS_STR=""
for arg in "$@"; do
  ARGS_STR="$ARGS_STR \"$(printf '%s' "$arg" | sed "s/\"/\\\\\"/g")\""
done

docker-compose exec -T statistics sh -c "
  export NODE_PATH=/tmp/tsx-cache/node_modules && \
  if [ ! -d /tmp/tsx-cache ] || [ ! -f /tmp/tsx-cache/node_modules/tsx/package.json ]; then
    echo 'Installing tsx for Linux platform...' && \
    mkdir -p /tmp/tsx-cache && \
    cd /tmp/tsx-cache && \
    npm init -y --silent > /dev/null 2>&1 && \
    npm install tsx@latest --silent && \
    cd /app
  fi && \
  cd /app && \
  NODE_PATH=/tmp/tsx-cache/node_modules:/app/node_modules /tmp/tsx-cache/node_modules/.bin/tsx scripts/produce-messages.ts $ARGS_STR
"


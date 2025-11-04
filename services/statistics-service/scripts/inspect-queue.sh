#!/bin/bash
# Inspect RabbitMQ queues and consumers using rabbitmqadmin CLI tool

echo "=== Queue Information ==="
docker-compose exec rabbitmq rabbitmqadmin list queues name messages consumers

echo ""
echo "=== Active Consumers ==="
docker-compose exec rabbitmq rabbitmqadmin list consumers

echo ""
echo "=== Connections ==="
docker-compose exec rabbitmq rabbitmqctl list_connections name peer_host peer_port state | head -10


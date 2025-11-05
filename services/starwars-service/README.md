# StarWars Service

A Node.js/TypeScript service that acts as a bridge between the BFF service and the public SWAPI (Star Wars API). It provides caching, data transformation, and event publishing capabilities.

## Features

- **Three main endpoints:**

  - `GET /api/films/:id` - Get film details with characters
  - `GET /people/:id` - Get person details with films
  - `GET /api/search?query=string&entityTypes=people,films` - Search across people and films

- **Redis Caching:** All routes cache responses for 1 day (DB 2)
- **RabbitMQ Events:** All requests publish query events to RabbitMQ for statistics tracking
- **Data Transformation:** Transforms SWAPI responses to match BFF expectations

## Architecture

The service follows a clean architecture pattern:

- **Domain:** Entity definitions and domain logic
- **Application:** Use cases and port interfaces
- **Infrastructure:** Redis cache, RabbitMQ publisher, HTTP SWAPI client
- **Web:** Express controllers, routes, and response mappers

## Environment Variables

- `PORT` - Service port (default: 8081)
- `SWAPI_BASE` - SWAPI base URL (default: https://www.swapi.tech/api)
- `REDIS_HOST` - Redis host (default: redis)
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_PASSWORD` - Redis password (optional)
- `REDIS_CACHE_DB` - Redis database number (default: 2)
- `RABBITMQ_HOST` - RabbitMQ host (default: rabbitmq)
- `RABBITMQ_PORT` - RabbitMQ port (default: 5672)
- `RABBITMQ_USER` - RabbitMQ username (default: guest)
- `RABBITMQ_PASS` - RabbitMQ password (default: guest)
- `RABBITMQ_QUEUE` - RabbitMQ queue name (default: query_events)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Testing

```bash
npm test
```

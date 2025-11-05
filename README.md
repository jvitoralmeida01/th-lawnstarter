# Star Wars Data Application

A microservices-based application that provides a user interface for querying Star Wars data from the public SWAPI (Star Wars API) and displaying query statistics. The system implements a Backend-for-Frontend (BFF) architecture with multiple caching layers, asynchronous event processing, and comprehensive statistics tracking.

## Architecture Overview

### README/ folder
Do read `README/DEVELOPMENT_NOTES.md` and take a look at `README/System Design.png` (or open `README/System Design.excalidraw` in the excalidraw website: https://excalidraw.com/)

The system consists of four main services working together:

- **Web Client** (React + TypeScript + Vite) - Frontend application
- **BFF Service** (Laravel/PHP) - Backend-for-Frontend layer with API response caching
- **StarWars Service** (Node.js + TypeScript) - Data fetching service with read-through caching
- **Statistics Service** (Node.js + TypeScript) - Statistics aggregation and query tracking

### System Design

The architecture follows a BFF pattern where:

1. The **Web Client** makes requests to the **BFF Service**
2. The **BFF Service** acts as an intermediary, caching responses and routing requests to appropriate backend services
3. The **StarWars Service** fetches data from SWAPI, caches responses, and publishes query events
4. The **Statistics Service** consumes query events asynchronously and provides aggregated statistics
5. **RabbitMQ** handles asynchronous message queuing for query events
6. **Redis** provides multi-layer caching (BFF uses DB 1, StarWars Service uses DB 2)
7. **PostgreSQL** stores query events and aggregated statistics

```
┌─────────┐      ┌─────────┐      ┌──────────────┐      ┌─────────┐
│   Web   │─────▶│   BFF   │─────▶│ StarWars     │─────▶│  SWAPI  │
│ (React) │      │(Laravel)│      │ Service      │      │ (External)
└─────────┘      └─────────┘      └──────────────┘      └─────────┘
                      │                    │
                      │                    │ (publishes events)
                      │                    ▼
                      │              ┌─────────┐
                      │              │ RabbitMQ│
                      │              └─────────┘
                      │                    │
                      │                    │ (consumes every 5 min)
                      │                    ▼
                      │              ┌──────────────┐
                      └─────────────▶│ Statistics   │
                                     │ Service      │
                                     └──────────────┘
                                            │
                                            ▼
                                      ┌─────────┐
                                      │PostgreSQL│
                                      └─────────┘
```

## Services

### Web Client

A React-based single-page application built with TypeScript and Vite. The application provides:

- **Search Page** (`/`) - Search across films and people
- **Film Detail Page** (`/film/:id`) - View film details with characters
- **People Detail Page** (`/people/:id`) - View person details with films
- **Statistics Page** (`/statistics`) - View query statistics and analytics

**Tech Stack:**

- React 19
- TypeScript
- Vite
- TailwindCSS
- React Router
- Axios
- Dependency Injection (tsyringe)

**Port:** 5173

### BFF Service

A Laravel-based Backend-for-Frontend service that:

- Aggregates requests from the frontend
- Implements intelligent caching with `stale-if-error` support
- Transforms responses from downstream services
- Handles error aggregation and graceful degradation

**Key Features:**

- **API Response Caching** - Caches responses from both StarWars and Statistics services
- **Cache Policy Resolution** - Prioritizes upstream cache headers, falls back to default policies
- **Stale-If-Error Support** - Returns stale data when upstream services are unavailable
- **Response Transformation** - Normalizes and transforms responses for frontend consumption

**Endpoints:**

- `GET /starwars/films/{id}` - Get film details
- `GET /starwars/people/{id}` - Get person details
- `GET /starwars/search?query={query}&entityTypes={types}` - Search across different entities
- `GET /statistics` - Get aggregated statistics

**Port:** 8080

**Cache Configuration:**

- Uses Redis DB 1 (`REDIS_CACHE_DB=1`)
- Cache keys prefixed with `bff:cache:`
- Supports `Cache-Control` headers with `s-maxage` and `stale-if-error` directives

### StarWars Service

A Node.js/TypeScript service that:

- Fetches data from the public SWAPI
- Implements read-through caching, that stores responses for 1 day, to get around the request limit on SWAPI
- Publishes query events to RabbitMQ for statistics tracking
- Transforms SWAPI responses to the proprietary format

**Endpoints:**

- `GET /api/films/:id` - Get film details with characters
- `GET /api/people/:id` - Get person details with films
- `GET /api/search?query={query}&entityTypes={types}` - Search across people and films
- `GET /api/health` - Health check

**Port:** 8081

**Features:**

- Redis caching (DB 2) with 1-day TTL
- RabbitMQ event publishing for all queries
- Data transformation and normalization
- Clean architecture pattern (Domain, Application, Infrastructure, Web layers)

### Statistics Service

A Node.js/TypeScript service that:

- Consumes query events from RabbitMQ via scheduled cron jobs (every 5 minutes)
- Aggregates statistics in PostgreSQL
- Provides API endpoints for statistics retrieval

**Endpoints:**

- `GET /api/top-queries` - Get top queries by resquest amount
- `GET /api/average-request-time` - Get average request time metrics
- `GET /api/popular-time` - Get popular query times
- `GET /api/health` - Health check

**Port:** 8082

**Features:**

- Asynchronous event processing via cron (configurable interval)
- PostgreSQL for persistent storage
- Statistics aggregation over configurable time windows (default: all time)
- Clean architecture pattern

## Infrastructure

### RabbitMQ

Message queue for asynchronous query event processing.

- **Port:** 5672 (AMQP)
- **Management UI:** 15672
- **Queue:** `query_events`
- **Default Credentials:** guest/guest

### Redis

Multi-purpose caching layer.

- **Port:** 6379
- **BFF Cache:** DB 1
- **StarWars Service Cache:** DB 2

### PostgreSQL

Relational database for statistics storage.

- **Port:** 5432
- **Database:** statistics
- **Default Credentials:** sw_user/sw_pass

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- PHP 8.2+ (for local BFF development)
- Composer (for PHP dependencies)

### Environment Setup

Environment files are located in the `env/` directory:

- `bff.env` - BFF service configuration
- `starwars-service.env` - StarWars service configuration
- `statistics-service.env` - Statistics service configuration
- `db.env` - PostgreSQL configuration

and inside each project's folder.

### Running the Application

1. **Start all services:**

   ```bash
   docker-compose up -d
   ```

2. **Access the application:**

   - Web Client: http://localhost:5173
   - BFF API: http://localhost:8080 ( /api/ prefixed )
   - StarWars Service: http://localhost:8081 ( /api/ prefixed )
   - Statistics Service: http://localhost:8082 ( /api/ prefixed )
   - RabbitMQ Management: http://localhost:15672 (guest/guest)
   - PostgreSQL: localhost:5432

3. **View logs:**
   ```bash
   docker-compose logs -f [service-name]
   ```

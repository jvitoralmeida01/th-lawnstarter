export const config = {
  port: parseInt(process.env.PORT || "8081", 10),

  swapi: {
    baseUrl: process.env.SWAPI_BASE || "https://www.swapi.tech/api",
  },

  redis: {
    host: process.env.REDIS_HOST || "redis",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_CACHE_DB || "2", 10), // DB 2 for starwars service
    ttl: 24 * 60 * 60, // 1 day in seconds
  },

  rabbitmq: {
    host: process.env.RABBITMQ_HOST || "rabbitmq",
    port: parseInt(process.env.RABBITMQ_PORT || "5672", 10),
    user: process.env.RABBITMQ_USER || "guest",
    password: process.env.RABBITMQ_PASS || "guest",
    queue: process.env.RABBITMQ_QUEUE || "query_events",
  },
};

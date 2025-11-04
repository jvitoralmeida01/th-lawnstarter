export const config = {
  port: parseInt(process.env.PORT || "8082", 10),

  database: {
    host: process.env.DB_HOST || "postgres",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_DATABASE || "statistics",
    user: process.env.DB_USERNAME || "sw_user",
    password: process.env.DB_PASSWORD || "sw_pass",
  },

  rabbitmq: {
    host: process.env.RABBITMQ_HOST || "rabbitmq",
    port: parseInt(process.env.RABBITMQ_PORT || "5672", 10),
    user: process.env.RABBITMQ_USER || "guest",
    password: process.env.RABBITMQ_PASS || "guest",
    queue: process.env.RABBITMQ_QUEUE || "query_events",
  },

  statistics: {
    windowHours: parseInt(process.env.STATS_WINDOW_HOURS || "24", 10),
  },
};

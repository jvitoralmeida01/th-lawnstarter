import express from "express";
import { config } from "./config.js";
import { createApiRouter } from "./web/routes/index.js";
import { useEventPublisher } from "./infrastructure/di/index.js";
import { container } from "./infrastructure/di/container.js";

async function main(): Promise<void> {
  try {
    // Connect to RabbitMQ with retry logic
    const eventPublisher = useEventPublisher();
    console.log("Connecting to RabbitMQ...");
    await eventPublisher.connect();

    const app = express();

    // Mount API routes - all endpoints under /api/
    app.use("/api", createApiRouter());

    app.listen(config.port, () => {
      console.log(`StarWars service listening on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start service:", error);
    process.exit(1);
  }
}

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  const eventPublisher = useEventPublisher();
  await eventPublisher.close();
  const cacheRepository = container.getCacheRepository();
  if (cacheRepository && "close" in cacheRepository) {
    await (cacheRepository as any).close();
  }
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  const eventPublisher = useEventPublisher();
  await eventPublisher.close();
  const cacheRepository = container.getCacheRepository();
  if (cacheRepository && "close" in cacheRepository) {
    await (cacheRepository as any).close();
  }
  process.exit(0);
});

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});

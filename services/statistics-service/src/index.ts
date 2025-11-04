import express from "express";
import cron from "node-cron";
import { config } from "./config.js";
import { createApiRouter } from "./web/routes/index.js";
import {
  useStatsSnapshotRepository,
  useEventBrokerRepository,
  useUpdateStatistics,
} from "./infrastructure/di/index.js";
import { HttpStatsSnapshotRepository } from "./infrastructure/http/HttpStatsSnapshotRepository.js";

async function startStatisticsUpdate(): Promise<void> {
  try {
    const updateStatistics = useUpdateStatistics();
    await updateStatistics.execute();
  } catch (error) {
    try {
      const eventBrokerRepository = useEventBrokerRepository();
      await eventBrokerRepository.close();
    } catch (closeError) {
      console.error("❌⏰ Error closing RabbitMQ connection:", closeError);
    }
  }
}

async function main(): Promise<void> {
  try {
    const statsSnapshotRepository = useStatsSnapshotRepository();
    if (statsSnapshotRepository instanceof HttpStatsSnapshotRepository) {
      await statsSnapshotRepository.initialize();
    }

    const app = express();

    app.use("/api", createApiRouter());

    app.listen(config.port, () => {
      console.log(`Statistics service listening on port ${config.port}`);
    });

    const cronExpression = `*/${config.statistics.scheduledIntervalMinutes} * * * *`;
    cron.schedule(cronExpression, async () => {
      await startStatisticsUpdate();
    });

    setTimeout(async () => {
      await startStatisticsUpdate();
    }, 10000);
  } catch (error) {
    console.error("Failed to start service:", error);
    process.exit(1);
  }
}

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  const eventBrokerRepository = useEventBrokerRepository();
  await eventBrokerRepository.close();
  const statsSnapshotRepository = useStatsSnapshotRepository();
  if (statsSnapshotRepository instanceof HttpStatsSnapshotRepository) {
    await statsSnapshotRepository.close();
  }
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  const eventBrokerRepository = useEventBrokerRepository();
  await eventBrokerRepository.close();
  const statsSnapshotRepository = useStatsSnapshotRepository();
  if (statsSnapshotRepository instanceof HttpStatsSnapshotRepository) {
    await statsSnapshotRepository.close();
  }
  process.exit(0);
});

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});

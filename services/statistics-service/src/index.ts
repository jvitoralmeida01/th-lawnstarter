import express from "express";
import cron from "node-cron";
import { config } from "./config.js";
import { database } from "./database.js";
import { rabbitMQConsumer } from "./rabbitmq.js";
import { createApiRouter } from "./api.js";

export async function startStatisticsUpdate(): Promise<void> {
  const startTime = new Date().getTime();
  try {
    console.log(
      `🔄⏰ Starting statistics update... [${new Date().toISOString()}]`
    );

    // Connect to RabbitMQ if not already connected
    if (!rabbitMQConsumer.isConnected()) {
      await rabbitMQConsumer.connect();
    }

    // Consume messages from queue
    await rabbitMQConsumer.consumeMessages();

    // Compute statistics snapshot
    await database.computeStatisticsSnapshot();

    console.log(
      `✅⏰ Statistics update completed in ${
        new Date().getTime() - startTime
      }ms [${new Date().toISOString()}]`
    );
  } catch (error) {
    console.error("❌⏰ Error during statistics update:", error);
    // Try to reconnect on next run
    try {
      await rabbitMQConsumer.close();
    } catch (closeError) {
      console.error("❌⏰ Error closing RabbitMQ connection:", closeError);
    }
  }
}

async function main(): Promise<void> {
  try {
    // Initialize database
    await database.initialize();

    // Create Express app
    const app = express();

    // Mount API routes
    app.use("/api", createApiRouter());

    // Start server
    app.listen(config.port, () => {
      console.log(`Statistics service listening on port ${config.port}`);
    });

    // Schedule cron job to run every 5 minutes
    // @TODO: change back to 5 minutes
    cron.schedule("*/1 * * * *", async () => {
      await startStatisticsUpdate();
    });

    // Run initial update after 10 seconds (to allow services to start)
    setTimeout(async () => {
      await startStatisticsUpdate();
    }, 10000);
  } catch (error) {
    console.error("Failed to start service:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await rabbitMQConsumer.close();
  await database.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  await rabbitMQConsumer.close();
  await database.close();
  process.exit(0);
});

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});

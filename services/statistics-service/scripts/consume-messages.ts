import { database } from "../src/database.js";
import { startStatisticsUpdate } from "../src/index.js";

async function main(): Promise<void> {
  try {
    console.log("Initializing database connection...");
    await database.initialize();

    console.log(
      "Starting statistics update (consuming RabbitMQ messages)...\n"
    );
    await startStatisticsUpdate();

    console.log("\nStatistics update completed successfully");
    await database.close();
    process.exit(0);
  } catch (error) {
    console.error("Error during statistics update:", error);
    try {
      await database.close();
    } catch (closeError) {
      // Ignore close errors
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});

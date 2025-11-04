// This script is purely for testing purposes !!

import { useUpdateStatistics } from "../src/infrastructure/di/index.js";
import { useStatsSnapshotRepository } from "../src/infrastructure/di/index.js";
import { HttpStatsSnapshotRepository } from "../src/infrastructure/http/HttpStatsSnapshotRepository.js";

async function consumeMessages(): Promise<void> {
  try {
    const statsSnapshotRepository = useStatsSnapshotRepository();

    if (statsSnapshotRepository instanceof HttpStatsSnapshotRepository) {
      await statsSnapshotRepository.initialize();
    }

    const updateStatistics = useUpdateStatistics();
    await updateStatistics.execute();

    console.log("Successfully consumed messages and updated statistics");
  } catch (error) {
    console.error("Error consuming messages:", error);
    throw error;
  }
}

consumeMessages()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to consume messages:", error);
    process.exit(1);
  });

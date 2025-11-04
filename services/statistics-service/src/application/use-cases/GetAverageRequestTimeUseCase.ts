import type { StatsSnapshotRepository } from "../ports/StatsSnapshotRepository.js";

export interface AverageRequestTime {
  averageTimeMs: number;
  computedAt?: Date;
}

export class GetAverageRequestTimeUseCase {
  constructor(private statsSnapshotRepository: StatsSnapshotRepository) {}

  async execute(): Promise<AverageRequestTime> {
    console.log("🔄📸 Getting latest snapshot...");
    const snapshot = await this.statsSnapshotRepository.getLatestSnapshot();

    if (!snapshot) {
      console.log("❌📸 No snapshot found");
      return {
        averageTimeMs: 0,
      };
    }

    console.log("✅📸 Latest snapshot:", JSON.stringify(snapshot, null, 3));

    return {
      averageTimeMs: snapshot.avg_ms,
      computedAt: snapshot.computed_at,
    };
  }
}

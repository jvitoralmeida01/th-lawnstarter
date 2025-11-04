import type { StatsSnapshotRepository } from "../ports/StatsSnapshotRepository.js";
import type { EventStorageRepository } from "../ports/EventStorageRepository.js";

export interface PopularTime {
  hour: string;
  requestCount: number;
  computedAt?: Date;
}

export class GetPopularTimeUseCase {
  constructor(
    private statsSnapshotRepository: StatsSnapshotRepository,
    private eventStorageRepository: EventStorageRepository
  ) {}

  async execute(): Promise<PopularTime> {
    console.log("🔄📸 Getting latest snapshot...");
    const snapshot = await this.statsSnapshotRepository.getLatestSnapshot();

    if (!snapshot) {
      console.log("❌📸 No snapshot found");
      return {
        hour: "0",
        requestCount: 0,
      };
    }
    console.log("✅📸 Latest snapshot:", JSON.stringify(snapshot, null, 3));

    console.log(
      "🔄🧮 Calculating request count for hour:",
      snapshot.popular_hour
    );
    const requestCount =
      await this.eventStorageRepository.getRequestCountForHour(
        snapshot.popular_hour,
        snapshot.window_start,
        snapshot.window_end
      );
    console.log("✅🧮 Calculated request count for hour:", requestCount);

    return {
      hour: snapshot.popular_hour.toString().padStart(2, "0"),
      requestCount,
      computedAt: snapshot.computed_at,
    };
  }
}

import type { ConsumeEventsUseCase } from "../application/use-cases/ConsumeEventsUseCase.js";
import type { StatsSnapshotRepository } from "../application/ports/StatsSnapshotRepository.js";

export class UpdateStatistics {
  constructor(
    private consumeEventsUseCase: ConsumeEventsUseCase,
    private statsSnapshotRepository: StatsSnapshotRepository
  ) {}

  async execute(): Promise<void> {
    const startTime = new Date().getTime();
    try {
      console.log(
        `🔄⏰ Starting statistics update... [${new Date().toISOString()}]`
      );

      await this.consumeEventsUseCase.execute();
      console.log(
        `🔄⏰ Events consumed for statistics update... [${new Date().toISOString()}]`
      );
      await this.statsSnapshotRepository.updateStatsSnapshot();
      console.log(
        `🔄⏰ Statistics snapshot updated... [${new Date().toISOString()}]`
      );

      console.log(
        `✅⏰ Statistics update completed in ${
          new Date().getTime() - startTime
        }ms [${new Date().toISOString()}]`
      );
    } catch (error) {
      console.error("❌⏰ Error during statistics update:", error);
      throw error;
    }
  }
}

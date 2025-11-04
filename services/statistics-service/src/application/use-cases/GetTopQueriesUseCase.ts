import type { StatsSnapshotRepository } from "../ports/StatsSnapshotRepository.js";

export interface TopQuery {
  query: string;
  percentage: number;
}

export interface GetTopQueriesResult {
  queries: TopQuery[];
  computedAt?: Date;
}

export class GetTopQueriesUseCase {
  constructor(private statsSnapshotRepository: StatsSnapshotRepository) {}

  async execute(): Promise<GetTopQueriesResult> {
    console.log("🔄📸 Getting latest snapshot...");
    const snapshot = await this.statsSnapshotRepository.getLatestSnapshot();

    if (!snapshot) {
      console.log("❌📸 No snapshot found");
      return {
        queries: [],
      };
    }
    console.log("✅📸 Latest snapshot:", JSON.stringify(snapshot, null, 3));

    return {
      queries: snapshot.top_queries.map((q) => ({
        query: q.route,
        percentage: q.pct,
      })),
      computedAt: snapshot.computed_at,
    };
  }
}

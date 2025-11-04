import type { StatsSnapshot } from "../../domain/entities/statsSnapshot.js";

export interface StatsSnapshotRepository {
  getLatestSnapshot(): Promise<StatsSnapshot | null>;
  updateStatsSnapshot(): Promise<void>;
}

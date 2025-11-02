import type { StatisticsEntity } from "src/domain/entities/StatisticsEntity";

export interface StatisticsRepository {
  getStatistics(): Promise<StatisticsEntity>;
}

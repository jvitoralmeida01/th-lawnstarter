import { injectable } from "tsyringe";
import type { StatisticsRepository } from "../../application/ports/StatisticsRepository";
import type { StatisticsEntity } from "src/domain/entities/StatisticsEntity";

@injectable()
export class MockStatisticsRepository implements StatisticsRepository {
  async getStatistics(): Promise<StatisticsEntity> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      topQueries: [
        { query: "search/", percentage: 80 },
        { query: "film/:id", percentage: 10 },
        { query: "people/:id", percentage: 6 },
        { query: "test/:id", percentage: 3 },
        { query: "other/:id", percentage: 1 },
      ],
      averageRequestTime: {
        averageTimeMs: 10,
      },
      popularTime: {
        hour: "1:21 PM",
        requestCount: 150,
      },
    };
  }
}

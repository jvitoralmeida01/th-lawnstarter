import { injectable } from "tsyringe";
import type { StatisticsRepository } from "../../application/ports/StatisticsRepository";
import {
  BffAxiosClient,
  BffEndpoints,
  type BffResponse,
} from "../BffAxiosClient";
import type { StatisticsEntity } from "../../domain/entities/StatisticsEntity";

@injectable()
export class HttpStatisticsRepository implements StatisticsRepository {
  async getStatistics(): Promise<StatisticsEntity> {
    const response: BffResponse<StatisticsEntity> = await BffAxiosClient.get(
      BffEndpoints.Statistics
    );

    if (response.status !== 200) {
      throw new Error(response.data.message || "Failed to fetch statistics");
    }

    return response.data.result;
  }
}

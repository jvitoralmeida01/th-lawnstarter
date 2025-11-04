import { injectable } from "tsyringe";
import type { StatisticsRepository } from "../../application/ports/StatisticsRepository";
import {
  BffAxiosClient,
  BffEndpoints,
  type GenericResponse,
} from "../BffAxiosClient";
import type {
  AverageRequestTimeEntity,
  PopularTimeEntity,
  StatisticsEntity,
  TopQueryEntity,
} from "../../domain/entities/StatisticsEntity";

interface StatisticsResponse {
  topQueries: {
    message: string;
    result: TopQueryEntity[];
  };
  averageRequestTime: {
    message: string;
    result: AverageRequestTimeEntity;
  };
  popularTime: {
    message: string;
    result: PopularTimeEntity;
  };
}

@injectable()
export class HttpStatisticsRepository implements StatisticsRepository {
  async getStatistics(): Promise<StatisticsEntity> {
    const response: GenericResponse<StatisticsResponse> =
      await BffAxiosClient.get(BffEndpoints.Statistics);

    if (response.status !== 200) {
      throw new Error(response.data.message || "Failed to fetch statistics");
    }

    return {
      topQueries: response.data.result.topQueries.result,
      averageRequestTime: response.data.result.averageRequestTime.result,
      popularTime: response.data.result.popularTime.result,
    };
  }
}

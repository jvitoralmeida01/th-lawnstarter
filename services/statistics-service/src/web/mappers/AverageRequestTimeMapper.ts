import type { AverageRequestTime } from "../../application/use-cases/GetAverageRequestTimeUseCase.js";

export interface AverageRequestTimeResponse {
  message: string;
  result: AverageRequestTime;
}

export class AverageRequestTimeMapper {
  static toResponse(
    averageRequestTime: AverageRequestTime
  ): AverageRequestTimeResponse {
    if (averageRequestTime.averageTimeMs === 0) {
      return {
        message: "No statistics available yet",
        result: {
          averageTimeMs: 0,
        },
      };
    }

    return {
      message: "OK",
      result: averageRequestTime,
    };
  }
}

import type { PopularTime } from "../../application/use-cases/GetPopularTimeUseCase.js";

export interface PopularTimeResponse {
  message: string;
  result: PopularTime;
}

export class PopularTimeMapper {
  static toResponse(popularTime: PopularTime): PopularTimeResponse {
    if (popularTime.requestCount === 0) {
      return {
        message: "No statistics available yet",
        result: {
          hour: "0",
          requestCount: 0,
        },
      };
    }

    return {
      message: "OK",
      result: popularTime,
    };
  }
}

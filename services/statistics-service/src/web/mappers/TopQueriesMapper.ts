import type { TopQuery } from "../../application/use-cases/GetTopQueriesUseCase.js";

export interface TopQueriesResponse {
  message: string;
  result: TopQuery[];
}

export class TopQueriesMapper {
  static toResponse(topQueries: TopQuery[]): TopQueriesResponse {
    if (topQueries.length === 0) {
      return {
        message: "No statistics available yet",
        result: [],
      };
    }

    return {
      message: "Top queries retrieved successfully",
      result: topQueries,
    };
  }
}

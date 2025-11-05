import type { SearchResult } from "../../domain/entities/swapi.js";

export class SearchMapper {
  static toResponse(results: SearchResult[]): {
    message: string;
    result: SearchResult[];
  } {
    return {
      message: "ok",
      result: results,
    };
  }
}

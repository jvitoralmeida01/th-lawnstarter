import { injectable } from "tsyringe";
import type SearchRepository from "../../application/ports/SearchRepository";
import type {
  SearchResultEntity,
  SearchResultEntityType,
} from "../../domain/entities/SearchResultEntity";
import {
  BffAxiosClient,
  BffEndpoints,
  type BffResponse,
} from "../BffAxiosClient";

@injectable()
export class HttpSearchRepository implements SearchRepository {
  async getMany(
    searchTerm: string,
    entityTypes: SearchResultEntityType[]
  ): Promise<SearchResultEntity[]> {
    const response: BffResponse<SearchResultEntity[]> =
      await BffAxiosClient.get(BffEndpoints.Search, {
        params: {
          query: searchTerm,
          entityTypes: entityTypes,
        },
      });

    if (response.status !== 200) {
      throw new Error(response.data.message || "Failed to search");
    }

    return response.data.result as SearchResultEntity[];
  }
}

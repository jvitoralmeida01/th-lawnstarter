import { injectable, inject } from "tsyringe";
import type {
  SearchResultEntity,
  SearchResultEntityType,
} from "../../../domain/entities/SearchResultEntity";
import type SearchRepository from "../../ports/SearchRepository";

@injectable()
export class GetSearchResultsUseCase {
  constructor(
    @inject("SearchRepository") private searchRepository: SearchRepository
  ) {}

  async execute(
    searchTerm: string,
    entityTypes: SearchResultEntityType[]
  ): Promise<SearchResultEntity[]> {
    return await this.searchRepository.getMany(searchTerm, entityTypes);
  }
}

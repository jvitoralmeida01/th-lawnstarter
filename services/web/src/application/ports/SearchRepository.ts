import type {
  SearchResultEntity,
  SearchResultEntityType,
} from "../../domain/entities/SearchResultEntity";

export default interface SearchRepository {
  getMany(
    searchTerm: string,
    entityTypes: SearchResultEntityType[]
  ): Promise<SearchResultEntity[]>;
}

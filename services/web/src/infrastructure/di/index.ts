import { container } from "./container";
import { GetPersonDetailsByIdUseCase } from "../../application/use-cases/people/GetPersonDetailsByIdUseCase";
import { GetFilmDetailsByIdUseCase } from "../../application/use-cases/films/GetFilmDetailsByIdUseCase";
import { GetSearchResultsUseCase } from "../../application/use-cases/search/SearchResultsUseCase";
import { GetStatisticsUseCase } from "../../application/use-cases/statistics/GetStatisticsUseCase";

export { container };

export function useGetPersonDetailsByIdUseCase() {
  return container.resolve(GetPersonDetailsByIdUseCase);
}

export function useGetFilmDetailsByIdUseCase() {
  return container.resolve(GetFilmDetailsByIdUseCase);
}

export function useGetSearchResultsUseCase() {
  return container.resolve(GetSearchResultsUseCase);
}

export function useGetStatisticsUseCase() {
  return container.resolve(GetStatisticsUseCase);
}

import type {
  SWAPIFilmResponse,
  SWAPIPersonResponse,
  SWAPISearchResponse,
  SWAPISearchResultItem,
} from "../../domain/entities/swapi.js";

export interface SWAPIRepository {
  getFilm(id: string): Promise<SWAPIFilmResponse>;
  getPerson(id: string): Promise<SWAPIPersonResponse>;
  searchPeople(
    query: string
  ): Promise<SWAPISearchResponse<SWAPISearchResultItem>>;
  searchFilms(
    query: string
  ): Promise<SWAPISearchResponse<SWAPISearchResultItem>>;
}

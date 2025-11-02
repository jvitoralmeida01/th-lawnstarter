import type { FilmDetailsEntity } from "../../domain/entities/FilmEntity";

export default interface FilmsRepository {
  getById(id: string): Promise<FilmDetailsEntity>;
}

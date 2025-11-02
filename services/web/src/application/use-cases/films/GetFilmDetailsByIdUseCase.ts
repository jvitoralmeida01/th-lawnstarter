import { injectable, inject } from "tsyringe";
import type { FilmDetailsEntity } from "../../../domain/entities/FilmEntity";
import type FilmsRepository from "../../ports/FilmsRepository";

@injectable()
export class GetFilmDetailsByIdUseCase {
  constructor(
    @inject("FilmsRepository") private filmsRepository: FilmsRepository
  ) {}

  async execute(id: string): Promise<FilmDetailsEntity> {
    return await this.filmsRepository.getById(id);
  }
}

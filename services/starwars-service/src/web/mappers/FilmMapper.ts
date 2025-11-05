import type { Film } from "../../domain/entities/swapi.js";

export class FilmMapper {
  static toResponse(film: Film): { message: string; result: Film } {
    return {
      message: "ok",
      result: film,
    };
  }
}

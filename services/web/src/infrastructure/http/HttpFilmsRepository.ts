import { injectable } from "tsyringe";
import type FilmsRepository from "../../application/ports/FilmsRepository";
import type { FilmDetailsEntity } from "../../domain/entities/FilmEntity";
import {
  BffAxiosClient,
  BffEndpoints,
  type GenericResponse,
} from "../BffAxiosClient";

@injectable()
export class HttpFilmsRepository implements FilmsRepository {
  async getById(id: string): Promise<FilmDetailsEntity> {
    const response: GenericResponse<FilmDetailsEntity> =
      await BffAxiosClient.get(`${BffEndpoints.Films}/${id}`);

    if (response.status !== 200) {
      throw new Error(response.data.message || "Failed to fetch film details");
    }

    return response.data.result;
  }
}

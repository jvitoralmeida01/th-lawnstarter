import { injectable } from "tsyringe";
import type PeopleRepository from "../../application/ports/PeopleRepository";
import type { PersonDetailsEntity } from "../../domain/entities/PersonEntity";
import {
  BffAxiosClient,
  BffEndpoints,
  type GenericResponse,
} from "../BffAxiosClient";

@injectable()
export class HttpPeopleRepository implements PeopleRepository {
  async getById(id: string): Promise<PersonDetailsEntity> {
    const response: GenericResponse<PersonDetailsEntity> =
      await BffAxiosClient.get(`${BffEndpoints.People}/${id}`);

    if (response.status !== 200) {
      throw new Error(
        response.data.message || "Failed to fetch person details"
      );
    }

    return response.data.result;
  }
}

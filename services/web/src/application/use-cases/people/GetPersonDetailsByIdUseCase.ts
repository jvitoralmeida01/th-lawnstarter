import { injectable, inject } from "tsyringe";
import type { PersonDetailsEntity } from "../../../domain/entities/PersonEntity";
import type PeopleRepository from "../../ports/PeopleRepository";

@injectable()
export class GetPersonDetailsByIdUseCase {
  constructor(
    @inject("PeopleRepository") private peopleRepository: PeopleRepository
  ) {}

  async execute(id: string): Promise<PersonDetailsEntity> {
    return await this.peopleRepository.getById(id);
  }
}

import type { PersonDetailsEntity } from "../../domain/entities/PersonEntity";

export default interface PeopleRepository {
  getById(id: string): Promise<PersonDetailsEntity>;
}

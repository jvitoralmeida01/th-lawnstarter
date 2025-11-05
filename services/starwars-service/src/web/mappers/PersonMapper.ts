import type { Person } from "../../domain/entities/swapi.js";

export class PersonMapper {
  static toResponse(person: Person): { message: string; result: Person } {
    return {
      message: "ok",
      result: person,
    };
  }
}

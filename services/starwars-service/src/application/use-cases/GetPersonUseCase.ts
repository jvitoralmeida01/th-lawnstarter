import type { Person } from "../../domain/entities/swapi.js";
import type { SWAPIRepository } from "../ports/SWAPIRepository.js";

export class GetPersonUseCase {
  constructor(private swapiRepository: SWAPIRepository) {}

  async execute(id: string): Promise<Person> {
    const swapiResponse = await this.swapiRepository.getPerson(id);

    const filmIds = swapiResponse.result.properties.films
      .map((url) => {
        const match = url.match(/\/films\/(\d+)\/?$/);
        return match ? match[1] : null;
      })
      .filter((id): id is string => id !== null);

    console.log(`Fetching ${filmIds.length} films for person: ${id}`);
    const films = await Promise.all(
      filmIds.map(async (filmId) => {
        const filmResponse = await this.swapiRepository.getFilm(filmId);
        return {
          id: filmId,
          name: filmResponse.result.properties.title,
        };
      })
    );

    const person: Person = {
      id: swapiResponse.result.uid,
      name: swapiResponse.result.properties.name,
      birthYear: swapiResponse.result.properties.birth_year,
      eyeColor: swapiResponse.result.properties.eye_color,
      gender: swapiResponse.result.properties.gender,
      hairColor: swapiResponse.result.properties.hair_color,
      height: swapiResponse.result.properties.height,
      mass: swapiResponse.result.properties.mass,
      skinColor: swapiResponse.result.properties.skin_color,
      films,
    };

    return person;
  }
}

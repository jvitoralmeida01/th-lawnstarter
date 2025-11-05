import type { Film } from "../../domain/entities/swapi.js";
import type { SWAPIRepository } from "../ports/SWAPIRepository.js";

export class GetFilmUseCase {
  constructor(private swapiRepository: SWAPIRepository) {}

  async execute(id: string): Promise<Film> {
    const swapiResponse = await this.swapiRepository.getFilm(id);

    const characterIds = swapiResponse.result.properties.characters
      .map((url) => {
        const match = url.match(/\/people\/(\d+)\/?$/);
        return match ? match[1] : null;
      })
      .filter((id): id is string => id !== null);

    console.log(`Fetching ${characterIds.length} characters for film: ${id}`);

    const characters = await Promise.all(
      characterIds.map(async (charId) => {
        const personResponse = await this.swapiRepository.getPerson(charId);
        return {
          id: charId,
          name: personResponse.result.properties.name,
        };
      })
    );

    const film: Film = {
      id: swapiResponse.result.uid,
      name: swapiResponse.result.properties.title,
      openingCrawl: swapiResponse.result.properties.opening_crawl,
      characters,
    };

    return film;
  }
}

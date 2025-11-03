import { injectable } from "tsyringe";
import type SearchRepository from "../../application/ports/SearchRepository";
import {
  type SearchResultEntity,
  SearchResultEntityType,
} from "../../domain/entities/SearchResultEntity";

@injectable()
export class MockSearchRepository implements SearchRepository {
  private mockPeople = [
    { id: "1", name: "Luke Skywalker" },
    { id: "2", name: "C-3PO" },
    { id: "3", name: "R2-D2" },
    { id: "4", name: "Darth Vader" },
    { id: "5", name: "Leia Organa" },
    { id: "6", name: "Han Solo" },
    { id: "7", name: "Chewbacca" },
    { id: "8", name: "Bib Fortuna" },
    { id: "9", name: "Biggs Darklighter" },
    { id: "10", name: "Obi-Wan Kenobi" },
    { id: "11", name: "Jar Jar Binks" },
  ];

  private mockFilms = [
    { id: "1", name: "A New Hope" },
    { id: "2", name: "The Empire Strikes Back" },
    { id: "3", name: "Return of the Jedi" },
  ];

  async getMany(
    searchTerm: string,
    entityTypes: SearchResultEntityType[]
  ): Promise<SearchResultEntity[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const results: SearchResultEntity[] = [];
    const lowerSearchTerm = searchTerm.toLowerCase();

    if (entityTypes.includes(SearchResultEntityType.People)) {
      const matchingPeople = this.mockPeople.filter((person) =>
        person.name.toLowerCase().includes(lowerSearchTerm)
      );
      results.push(
        ...matchingPeople.map((person) => ({
          id: person.id,
          name: person.name,
          type: SearchResultEntityType.People as SearchResultEntityType,
        }))
      );
    }

    if (entityTypes.includes(SearchResultEntityType.Films)) {
      const matchingFilms = this.mockFilms.filter((film) =>
        film.name.toLowerCase().includes(lowerSearchTerm)
      );
      results.push(
        ...matchingFilms.map((film) => ({
          id: film.id,
          name: film.name,
          type: SearchResultEntityType.Films as SearchResultEntityType,
        }))
      );
    }

    return results;
  }
}

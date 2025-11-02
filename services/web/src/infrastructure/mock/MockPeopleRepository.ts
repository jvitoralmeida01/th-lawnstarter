import { injectable } from "tsyringe";
import type PeopleRepository from "../../application/ports/PeopleRepository";
import type { PersonDetailsEntity } from "../../domain/entities/PersonEntity";
import type { FilmEntity } from "../../domain/entities/FilmEntity";

@injectable()
export class MockPeopleRepository implements PeopleRepository {
  private mockPeople: Map<string, PersonDetailsEntity> = new Map([
    [
      "1",
      {
        id: "1",
        name: "Luke Skywalker",
        birthYear: "19BBY",
        gender: "male",
        eyeColor: "blue",
        hairColor: "blond",
        height: 172,
        mass: 77,
        films: [
          { id: "1", name: "A New Hope" },
          { id: "2", name: "The Empire Strikes Back" },
          { id: "3", name: "Return of the Jedi" },
        ] as FilmEntity[],
      },
    ],
    [
      "2",
      {
        id: "2",
        name: "C-3PO",
        birthYear: "112BBY",
        gender: "n/a",
        eyeColor: "yellow",
        hairColor: "n/a",
        height: 167,
        mass: 75,
        films: [{ id: "1", name: "A New Hope" }] as FilmEntity[],
      },
    ],
    [
      "3",
      {
        id: "3",
        name: "R2-D2",
        birthYear: "33BBY",
        gender: "n/a",
        eyeColor: "red",
        hairColor: "n/a",
        height: 96,
        mass: 32,
        films: [{ id: "1", name: "A New Hope" }] as FilmEntity[],
      },
    ],
    [
      "4",
      {
        id: "4",
        name: "Darth Vader",
        birthYear: "41.9BBY",
        gender: "male",
        eyeColor: "yellow",
        hairColor: "none",
        height: 202,
        mass: 136,
        films: [
          { id: "1", name: "A New Hope" },
          { id: "2", name: "The Empire Strikes Back" },
          { id: "3", name: "Return of the Jedi" },
        ] as FilmEntity[],
      },
    ],
    [
      "5",
      {
        id: "5",
        name: "Leia Organa",
        birthYear: "19BBY",
        gender: "female",
        eyeColor: "brown",
        hairColor: "brown",
        height: 150,
        mass: 49,
        films: [
          { id: "1", name: "A New Hope" },
          { id: "2", name: "The Empire Strikes Back" },
          { id: "3", name: "Return of the Jedi" },
        ] as FilmEntity[],
      },
    ],
    [
      "6",
      {
        id: "6",
        name: "Han Solo",
        birthYear: "29BBY",
        gender: "male",
        eyeColor: "brown",
        hairColor: "brown",
        height: 180,
        mass: 80,
        films: [
          { id: "2", name: "The Empire Strikes Back" },
          { id: "3", name: "Return of the Jedi" },
        ] as FilmEntity[],
      },
    ],
    [
      "7",
      {
        id: "7",
        name: "Chewbacca",
        birthYear: "200BBY",
        gender: "male",
        eyeColor: "blue",
        hairColor: "brown",
        height: 228,
        mass: 112,
        films: [
          { id: "2", name: "The Empire Strikes Back" },
          { id: "3", name: "Return of the Jedi" },
        ] as FilmEntity[],
      },
    ],
    [
      "8",
      {
        id: "8",
        name: "Bib Fortuna",
        birthYear: "24BBY",
        gender: "male",
        eyeColor: "brown",
        hairColor: "black",
        height: 183,
        mass: 84,
        films: [{ id: "3", name: "Return of the Jedi" }] as FilmEntity[],
      },
    ],
  ]);

  async getById(id: string): Promise<PersonDetailsEntity> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const person = this.mockPeople.get(id);
    if (!person) {
      throw new Error(`Person with id ${id} not found`);
    }

    return person;
  }
}

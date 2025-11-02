import { injectable } from "tsyringe";
import type FilmsRepository from "../../application/ports/FilmsRepository";
import type { FilmDetailsEntity } from "../../domain/entities/FilmEntity";
import type { PersonEntity } from "../../domain/entities/PersonEntity";

@injectable()
export class MockFilmRepository implements FilmsRepository {
  private mockFilms: Map<string, FilmDetailsEntity> = new Map([
    [
      "1",
      {
        id: "1",
        name: "A New Hope",
        openingCrawl:
          "It is a period of civil war.\r\nRebel spaceships, striking\r\nfrom a hidden base, have won\r\ntheir first victory against\r\nthe evil Galactic Empire.\r\n\r\nDuring the battle, Rebel\r\nspies managed to steal secret\r\nplans to the Empire's\r\nultimate weapon, the DEATH\r\nSTAR, an armored space\r\nstation with enough power\r\nto destroy an entire planet.\r\n\r\nPursued by the Empire's\r\nsinister agents, Princess\r\nLeia races home aboard her\r\nstarship, custodian of the\r\nstolen plans that can save her\r\npeople and restore\r\nfreedom to the galaxy\r\nIt is a period of civil war.\r\nRebel spaceships, striking\r\nfrom a hidden base, have won\r\ntheir first victory against\r\nthe evil Galactic Empire.\r\n\r\nDuring the battle, Rebel\r\nspies managed to steal secret\r\nplans to the Empire's\r\nultimate weapon, the DEATH\r\nSTAR, an armored space\r\nstation with enough power\r\nto destroy an entire planet.\r\n\r\nPursued by the Empire's\r\nsinister agents, Princess\r\nLeia races home aboard her\r\nstarship, custodian of the\r\nstolen plans that can save her\r\npeople and restore\r\nfreedom to the galaxy....",
        characters: [
          { id: "1", name: "Luke Skywalker" },
          { id: "2", name: "C-3PO" },
          { id: "3", name: "R2-D2" },
          { id: "4", name: "Darth Vader" },
          { id: "5", name: "Leia Organa" },
        ] as PersonEntity[],
      },
    ],
    [
      "2",
      {
        id: "2",
        name: "The Empire Strikes Back",
        openingCrawl:
          "It is a dark time for the\r\nRebellion. Although the Death\r\nStar has been destroyed,\r\nImperial troops have driven the\r\nRebel forces from their hidden\r\nbase and pursued them across\r\nthe galaxy.\r\n\r\nEvading the dreaded Imperial\r\nStarfleet, a group of freedom\r\nfighters led by Luke Skywalker\r\nhas established a new secret\r\nbase on the remote ice world\r\nof Hoth.\r\n\r\nThe evil lord Darth Vader,\r\nobsessed with finding young\r\nSkywalker, has dispatched\r\nthousands of remote probes into\r\nthe far reaches of space....",
        characters: [
          { id: "1", name: "Luke Skywalker" },
          { id: "4", name: "Darth Vader" },
          { id: "5", name: "Leia Organa" },
          { id: "6", name: "Han Solo" },
          { id: "7", name: "Chewbacca" },
        ] as PersonEntity[],
      },
    ],
    [
      "3",
      {
        id: "3",
        name: "Return of the Jedi",
        openingCrawl:
          "Luke Skywalker has returned to\r\nhis home planet of Tatooine in\r\nan attempt to rescue his\r\nfriend Han Solo from the\r\nclutches of the vile gangster\r\nJabba the Hutt.\r\n\r\nLittle does Luke know that the\r\nGALACTIC EMPIRE has secretly\r\nbegun construction on a new\r\narmored space station even\r\nmore powerful than the first\r\ndreaded Death Star.\r\n\r\nWhen completed, this ultimate\r\nweapon will spell certain doom\r\nfor the small band of rebels\r\nstruggling to restore freedom\r\nto the galaxy...",
        characters: [
          { id: "1", name: "Luke Skywalker" },
          { id: "4", name: "Darth Vader" },
          { id: "5", name: "Leia Organa" },
          { id: "6", name: "Han Solo" },
          { id: "7", name: "Chewbacca" },
        ] as PersonEntity[],
      },
    ],
  ]);

  async getById(id: string): Promise<FilmDetailsEntity> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const film = this.mockFilms.get(id);
    if (!film) {
      throw new Error(`Film with id ${id} not found`);
    }

    return film;
  }
}

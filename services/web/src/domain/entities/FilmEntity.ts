import type { PersonEntity } from "./PersonEntity";

export type FilmEntity = {
  id: string;
  name: string;
};

export type FilmDetailsEntity = FilmEntity & {
  openingCrawl: string;
  characters: PersonEntity[];
};

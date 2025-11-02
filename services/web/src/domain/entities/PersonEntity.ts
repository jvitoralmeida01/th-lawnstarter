import type { FilmEntity } from "./FilmEntity";

export type PersonEntity = {
  id: string;
  name: string;
};

export type PersonDetailsEntity = PersonEntity & {
  birthYear: string;
  gender: string;
  eyeColor: string;
  hairColor: string;
  height: number;
  mass: number;
  films: FilmEntity[];
};

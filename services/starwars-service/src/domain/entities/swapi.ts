// SWAPI Response Types
export interface SWAPIFilmResponse {
  message: string;
  result: {
    properties: {
      title: string;
      opening_crawl: string;
      characters: string[];
    };
    uid: string;
  };
}

export interface SWAPIPersonResponse {
  message: string;
  result: {
    properties: {
      name: string;
      birth_year: string;
      eye_color: string;
      gender: string;
      hair_color: string;
      height: string;
      mass: string;
      skin_color: string;
      films: string[];
    };
    uid: string;
  };
}

export interface SWAPISearchResponse<T> {
  message: string;
  result: T[];
}

export interface SWAPISearchResultItem {
  properties: {
    name?: string;
    title?: string;
    [key: string]: any;
  };
  uid?: string;
  url?: string;
}

// Transformed Types for BFF
export interface Film {
  id: string;
  name: string;
  openingCrawl: string;
  characters: {
    id: string;
    name: string;
  }[];
}

export interface Person {
  id: string;
  name: string;
  birthYear: string;
  eyeColor: string;
  gender: string;
  hairColor: string;
  height: string;
  mass: string;
  skinColor: string;
  films: {
    id: string;
    name: string;
  }[];
}

export interface SearchResult {
  id: string;
  name: string;
  entityType: "people" | "films";
}

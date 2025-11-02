export type SearchResultEntity = {
  id: string;
  name: string;
  type: SearchResultEntityType;
};

export const SearchResultEntityType = {
  Person: "person",
  Film: "film",
};

export type SearchResultEntityType =
  (typeof SearchResultEntityType)[keyof typeof SearchResultEntityType];

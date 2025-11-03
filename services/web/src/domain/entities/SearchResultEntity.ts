export type SearchResultEntity = {
  id: string;
  name: string;
  entityType: SearchResultEntityType;
};

export const SearchResultEntityType = {
  People: "people",
  Films: "films",
};

export type SearchResultEntityType =
  (typeof SearchResultEntityType)[keyof typeof SearchResultEntityType];

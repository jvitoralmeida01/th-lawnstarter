import axios, { type AxiosResponse } from "axios";

export const BffAxiosClient = axios.create({
  baseURL: import.meta.env.VITE_BFF_BASE_URL,
  timeout: 5000,
});

export const BffEndpoints = {
  Films: "/api/starwars/films",
  People: "/api/starwars/people",
  Search: "/api/starwars/search",
  Statistics: "/api/statistics",
};

export type BffResponse<T> = AxiosResponse<{ message: string; result: T }>;

export type BffEndpoint = (typeof BffEndpoints)[keyof typeof BffEndpoints];

import axios, { type AxiosResponse } from "axios";

export const BffAxiosClient = axios.create({
  baseURL: import.meta.env.VITE_BFF_BASE_URL,
  timeout: 5000,
});

export const BffEndpoints = {
  Films: "/films",
  People: "/people",
  Search: "/search",
  Statistics: "/statistics",
};

export type BffResponse<T> = AxiosResponse<{ message: string; result: T }>;

export type BffEndpoint = (typeof BffEndpoints)[keyof typeof BffEndpoints];

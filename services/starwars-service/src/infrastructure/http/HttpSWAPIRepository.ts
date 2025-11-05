import axios, { AxiosInstance } from "axios";
import { config } from "../../config.js";
import type { SWAPIRepository } from "../../application/ports/SWAPIRepository.js";
import type { CacheRepository } from "../../application/ports/CacheRepository.js";
import type {
  SWAPIFilmResponse,
  SWAPIPersonResponse,
  SWAPISearchResponse,
  SWAPISearchResultItem,
} from "../../domain/entities/swapi.js";

export class HttpSWAPIRepository implements SWAPIRepository {
  private client: AxiosInstance;

  constructor(private cacheRepository: CacheRepository) {
    this.client = axios.create({
      baseURL: config.swapi.baseUrl,
      timeout: 10000,
    });
  }

  async getFilm(id: string): Promise<SWAPIFilmResponse> {
    const cacheKey = `swapi:film:${id}`;

    const cached = await this.cacheRepository.get<SWAPIFilmResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.client.get<SWAPIFilmResponse>(`/films/${id}`);
    const data = response.data;

    await this.cacheRepository.set(
      cacheKey,
      JSON.stringify(data),
      config.redis.ttl
    );

    return data;
  }

  async getPerson(id: string): Promise<SWAPIPersonResponse> {
    const cacheKey = `swapi:person:${id}`;

    const cached = await this.cacheRepository.get<SWAPIPersonResponse>(
      cacheKey
    );
    if (cached) {
      return cached;
    }

    const response = await this.client.get<SWAPIPersonResponse>(
      `/people/${id}`
    );
    const data = response.data;

    await this.cacheRepository.set(
      cacheKey,
      JSON.stringify(data),
      config.redis.ttl
    );

    return data;
  }

  async searchPeople(
    query: string
  ): Promise<SWAPISearchResponse<SWAPISearchResultItem>> {
    const cacheKey = `swapi:search:people:${query}`;

    const cached = await this.cacheRepository.get<
      SWAPISearchResponse<SWAPISearchResultItem>
    >(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.client.get<
      SWAPISearchResponse<SWAPISearchResultItem>
    >(`/people`, {
      params: { name: query },
    });
    const data = response.data;

    await this.cacheRepository.set(
      cacheKey,
      JSON.stringify(data),
      config.redis.ttl
    );

    return data;
  }

  async searchFilms(
    query: string
  ): Promise<SWAPISearchResponse<SWAPISearchResultItem>> {
    const cacheKey = `swapi:search:films:${query}`;

    const cached = await this.cacheRepository.get<
      SWAPISearchResponse<SWAPISearchResultItem>
    >(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.client.get<
      SWAPISearchResponse<SWAPISearchResultItem>
    >(`/films`, {
      params: { name: query },
    });
    const data = response.data;

    await this.cacheRepository.set(
      cacheKey,
      JSON.stringify(data),
      config.redis.ttl
    );

    return data;
  }
}

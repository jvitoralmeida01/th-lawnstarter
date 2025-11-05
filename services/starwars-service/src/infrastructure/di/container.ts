import { config } from "../../config.js";
import type { CacheRepository } from "../../application/ports/CacheRepository.js";
import type { EventPublisher } from "../../application/ports/EventPublisher.js";
import type { SWAPIRepository } from "../../application/ports/SWAPIRepository.js";
import { RedisCacheRepository } from "../cache/RedisCacheRepository.js";
import { RabbitMQEventPublisher } from "../rabbitmq/RabbitMQEventPublisher.js";
import { HttpSWAPIRepository } from "../http/HttpSWAPIRepository.js";
import { GetFilmUseCase } from "../../application/use-cases/GetFilmUseCase.js";
import { GetPersonUseCase } from "../../application/use-cases/GetPersonUseCase.js";
import { SearchUseCase } from "../../application/use-cases/SearchUseCase.js";

class Container {
  private cacheRepository: CacheRepository | null = null;
  private eventPublisher: EventPublisher | null = null;
  private swapiRepository: SWAPIRepository | null = null;
  private getFilmUseCase: GetFilmUseCase | null = null;
  private getPersonUseCase: GetPersonUseCase | null = null;
  private searchUseCase: SearchUseCase | null = null;

  getCacheRepository(): CacheRepository {
    if (!this.cacheRepository) {
      this.cacheRepository = new RedisCacheRepository();
    }
    return this.cacheRepository;
  }

  getEventPublisher(): EventPublisher {
    if (!this.eventPublisher) {
      this.eventPublisher = new RabbitMQEventPublisher();
    }
    return this.eventPublisher;
  }

  getSWAPIRepository(): SWAPIRepository {
    if (!this.swapiRepository) {
      this.swapiRepository = new HttpSWAPIRepository(this.getCacheRepository());
    }
    return this.swapiRepository;
  }

  getGetFilmUseCase(): GetFilmUseCase {
    if (!this.getFilmUseCase) {
      this.getFilmUseCase = new GetFilmUseCase(this.getSWAPIRepository());
    }
    return this.getFilmUseCase;
  }

  getGetPersonUseCase(): GetPersonUseCase {
    if (!this.getPersonUseCase) {
      this.getPersonUseCase = new GetPersonUseCase(this.getSWAPIRepository());
    }
    return this.getPersonUseCase;
  }

  getSearchUseCase(): SearchUseCase {
    if (!this.searchUseCase) {
      this.searchUseCase = new SearchUseCase(this.getSWAPIRepository());
    }
    return this.searchUseCase;
  }
}

export const container = new Container();

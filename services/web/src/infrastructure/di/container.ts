import "reflect-metadata";
import { container } from "tsyringe";

// Repositories
// import { HttpPeopleRepository } from "../http/HttpPeopleRepository";
import { MockPeopleRepository } from "../mock/MockPeopleRepository";
// import { HttpFilmsRepository } from "../http/HttpFilmsRepository";
import { MockFilmRepository } from "../mock/MockFilmRepository";
// import { HttpSearchRepository } from "../http/HttpSearchRepository";
import { MockSearchRepository } from "../mock/MockSearchRepository";
// import { HttpStatisticsRepository } from "../http/HttpStatisticsRepository";
import { MockStatisticsRepository } from "../mock/MockStatisticsRepository";

// Repository Interfaces
import type PeopleRepository from "../../application/ports/PeopleRepository";
import type FilmsRepository from "../../application/ports/FilmsRepository";
import type SearchRepository from "../../application/ports/SearchRepository";
import type { StatisticsRepository } from "../../application/ports/StatisticsRepository";

// Use Cases
import { GetPersonDetailsByIdUseCase } from "../../application/use-cases/people/GetPersonDetailsByIdUseCase";
import { GetFilmDetailsByIdUseCase } from "../../application/use-cases/films/GetFilmDetailsByIdUseCase";
import { GetSearchResultsUseCase } from "../../application/use-cases/search/SearchResultsUseCase";
import { GetStatisticsUseCase } from "../../application/use-cases/statistics/GetStatisticsUseCase";

// Register repositories with tokens
container.register<PeopleRepository>("PeopleRepository", {
  useClass: MockPeopleRepository,
});

container.register<FilmsRepository>("FilmsRepository", {
  useClass: MockFilmRepository,
});

container.register<SearchRepository>("SearchRepository", {
  useClass: MockSearchRepository,
});

container.register<StatisticsRepository>("StatisticsRepository", {
  useClass: MockStatisticsRepository,
});

// Register use cases
container.register(GetPersonDetailsByIdUseCase, {
  useClass: GetPersonDetailsByIdUseCase,
});

container.register(GetFilmDetailsByIdUseCase, {
  useClass: GetFilmDetailsByIdUseCase,
});

container.register(GetSearchResultsUseCase, {
  useClass: GetSearchResultsUseCase,
});

container.register(GetStatisticsUseCase, {
  useClass: GetStatisticsUseCase,
});

// Export the container
export { container };

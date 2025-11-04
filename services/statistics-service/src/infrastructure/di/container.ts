import pg from "pg";
import { config } from "../../config.js";
import type { StatsSnapshotRepository } from "../../application/ports/StatsSnapshotRepository.js";
import type { EventStorageRepository } from "../../application/ports/EventStorageRepository.js";
import type { EventBrokerRepository } from "../../application/ports/EventBrokerRepository.js";
import { HttpStatsSnapshotRepository } from "../http/HttpStatsSnapshotRepository.js";
import { HttpEventStorageRepository } from "../http/HttpEventStorageRepository.js";
import { RabbitMQEventBrokerRepository } from "../rabbitmq/RabbitMQEventBrokerRepository.js";
import { GetTopQueriesUseCase } from "../../application/use-cases/GetTopQueriesUseCase.js";
import { GetAverageRequestTimeUseCase } from "../../application/use-cases/GetAverageRequestTimeUseCase.js";
import { GetPopularTimeUseCase } from "../../application/use-cases/GetPopularTimeUseCase.js";
import { ConsumeEventsUseCase } from "../../application/use-cases/ConsumeEventsUseCase.js";
import { UpdateStatistics } from "../../schedule/UpdateStatistics.js";

const { Pool } = pg;

class Container {
  private dbPool: pg.Pool | null = null;
  private statsSnapshotRepository: StatsSnapshotRepository | null = null;
  private eventStorageRepository: EventStorageRepository | null = null;
  private eventBrokerRepository: EventBrokerRepository | null = null;
  private getTopQueriesUseCase: GetTopQueriesUseCase | null = null;
  private getAverageRequestTimeUseCase: GetAverageRequestTimeUseCase | null =
    null;
  private getPopularTimeUseCase: GetPopularTimeUseCase | null = null;
  private consumeEventsUseCase: ConsumeEventsUseCase | null = null;
  private updateStatistics: UpdateStatistics | null = null;

  private getDbPool(): pg.Pool {
    if (!this.dbPool) {
      this.dbPool = new Pool({
        host: config.database.host,
        port: config.database.port,
        database: config.database.database,
        user: config.database.user,
        password: config.database.password,
      });
    }
    return this.dbPool;
  }

  getStatsSnapshotRepository(): StatsSnapshotRepository {
    if (!this.statsSnapshotRepository) {
      this.statsSnapshotRepository = new HttpStatsSnapshotRepository(
        this.getDbPool()
      );
    }
    return this.statsSnapshotRepository;
  }

  getEventStorageRepository(): EventStorageRepository {
    if (!this.eventStorageRepository) {
      this.eventStorageRepository = new HttpEventStorageRepository(
        this.getDbPool()
      );
    }
    return this.eventStorageRepository;
  }

  getEventBrokerRepository(): EventBrokerRepository {
    if (!this.eventBrokerRepository) {
      this.eventBrokerRepository = new RabbitMQEventBrokerRepository();
    }
    return this.eventBrokerRepository;
  }

  getGetTopQueriesUseCase(): GetTopQueriesUseCase {
    if (!this.getTopQueriesUseCase) {
      this.getTopQueriesUseCase = new GetTopQueriesUseCase(
        this.getStatsSnapshotRepository()
      );
    }
    return this.getTopQueriesUseCase;
  }

  getGetAverageRequestTimeUseCase(): GetAverageRequestTimeUseCase {
    if (!this.getAverageRequestTimeUseCase) {
      this.getAverageRequestTimeUseCase = new GetAverageRequestTimeUseCase(
        this.getStatsSnapshotRepository()
      );
    }
    return this.getAverageRequestTimeUseCase;
  }

  getGetPopularTimeUseCase(): GetPopularTimeUseCase {
    if (!this.getPopularTimeUseCase) {
      this.getPopularTimeUseCase = new GetPopularTimeUseCase(
        this.getStatsSnapshotRepository(),
        this.getEventStorageRepository()
      );
    }
    return this.getPopularTimeUseCase;
  }

  getConsumeEventsUseCase(): ConsumeEventsUseCase {
    if (!this.consumeEventsUseCase) {
      this.consumeEventsUseCase = new ConsumeEventsUseCase(
        this.getEventBrokerRepository(),
        this.getEventStorageRepository()
      );
    }
    return this.consumeEventsUseCase;
  }

  getUpdateStatistics(): UpdateStatistics {
    if (!this.updateStatistics) {
      this.updateStatistics = new UpdateStatistics(
        this.getConsumeEventsUseCase(),
        this.getStatsSnapshotRepository()
      );
    }
    return this.updateStatistics;
  }
}

export const container = new Container();

import { injectable, inject } from "tsyringe";
import type { StatisticsRepository } from "../../ports/StatisticsRepository";
import type { StatisticsEntity } from "src/domain/entities/StatisticsEntity";

@injectable()
export class GetStatisticsUseCase {
  constructor(
    @inject("StatisticsRepository")
    private statisticsRepository: StatisticsRepository
  ) {}

  async execute(): Promise<StatisticsEntity> {
    return await this.statisticsRepository.getStatistics();
  }
}

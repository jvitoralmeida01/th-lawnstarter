import type { EventBrokerRepository } from "../ports/EventBrokerRepository.js";
import type { EventStorageRepository } from "../ports/EventStorageRepository.js";

export class ConsumeEventsUseCase {
  constructor(
    private eventBrokerRepository: EventBrokerRepository,
    private eventStorageRepository: EventStorageRepository
  ) {}

  async execute(): Promise<void> {
    if (!this.eventBrokerRepository.isConnected()) {
      await this.eventBrokerRepository.connect();
    }

    await this.eventBrokerRepository.consumeQueryEvents(async (events) => {
      await this.eventStorageRepository.insertQueryEvents(events);
    });
  }
}

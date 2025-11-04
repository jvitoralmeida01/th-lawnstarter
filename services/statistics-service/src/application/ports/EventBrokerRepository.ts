import type { QueryEvent } from "../../domain/entities/queryEvent.js";

export interface EventBrokerRepository {
  connect(): Promise<void>;
  isConnected(): boolean;
  consumeQueryEvents(
    onEventsBatch: (events: QueryEvent[]) => Promise<void>
  ): Promise<void>;
  close(): Promise<void>;
}

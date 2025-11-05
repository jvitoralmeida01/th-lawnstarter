import type { QueryEvent } from "../../domain/entities/queryEvent.js";

export interface EventPublisher {
  connect(): Promise<void>;
  publish(event: QueryEvent): Promise<void>;
  close(): Promise<void>;
}

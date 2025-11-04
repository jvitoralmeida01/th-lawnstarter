import type { QueryEvent } from "../../domain/entities/queryEvent.js";

export interface EventStorageRepository {
  insertQueryEvents(events: QueryEvent[]): Promise<void>;
  getRequestCountForHour(
    hour: number,
    windowStart: Date,
    windowEnd: Date
  ): Promise<number>;
}

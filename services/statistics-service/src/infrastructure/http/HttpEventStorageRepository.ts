import pg from "pg";
import { config } from "../../config.js";
import type { EventStorageRepository } from "../../application/ports/EventStorageRepository.js";
import type { QueryEvent } from "../../domain/entities/queryEvent.js";

const { Pool } = pg;

export class HttpEventStorageRepository implements EventStorageRepository {
  private pool: pg.Pool;

  constructor(pool?: pg.Pool) {
    this.pool =
      pool ||
      new Pool({
        host: config.database.host,
        port: config.database.port,
        database: config.database.database,
        user: config.database.user,
        password: config.database.password,
      });
  }

  async insertQueryEvents(events: QueryEvent[]): Promise<void> {
    if (events.length === 0) {
      return;
    }

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      for (const event of events) {
        const query = event.occurred_at
          ? `
          INSERT INTO query_events (path, route, ms, source, occurred_at)
          VALUES ($1, $2, $3, $4, $5)
        `
          : `
          INSERT INTO query_events (path, route, ms, source)
          VALUES ($1, $2, $3, $4)
        `;
        const params = event.occurred_at
          ? [
              event.path,
              event.route,
              event.ms,
              event.source || "starwars",
              event.occurred_at,
            ]
          : [event.path, event.route, event.ms, event.source || "starwars"];
        await client.query(query, params);
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getRequestCountForHour(
    hour: number,
    windowStart: Date,
    windowEnd: Date
  ): Promise<number> {
    const useAllTime = config.statistics.windowHours <= 0;

    console.log(
      `🔍 Querying request count for hour ${hour} ${
        useAllTime
          ? "across all time"
          : `between ${windowStart.toISOString()} and ${windowEnd.toISOString()}`
      }`
    );

    const query = useAllTime
      ? `
      SELECT COUNT(*) as count
      FROM query_events
      WHERE EXTRACT(HOUR FROM occurred_at AT TIME ZONE 'UTC') = $1
    `
      : `
      SELECT COUNT(*) as count
      FROM query_events
      WHERE EXTRACT(HOUR FROM occurred_at AT TIME ZONE 'UTC') = $1
      AND occurred_at >= $2::timestamptz
      AND occurred_at < $3::timestamptz
    `;

    const params = useAllTime ? [hour] : [hour, windowStart, windowEnd];
    const result = await this.pool.query(query, params);
    const count = parseInt(result.rows[0].count, 10);

    console.log(
      `✅ Found ${count} requests for hour ${hour} ${
        useAllTime ? "across all time" : "in the specified window"
      }`
    );

    return count;
  }
}

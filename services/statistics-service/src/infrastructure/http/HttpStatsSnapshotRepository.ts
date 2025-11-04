import pg from "pg";
import { config } from "../../config.js";
import type { StatsSnapshotRepository } from "../../application/ports/StatsSnapshotRepository.js";
import type { StatsSnapshot } from "../../domain/entities/statsSnapshot.js";

const { Pool } = pg;

export class HttpStatsSnapshotRepository implements StatsSnapshotRepository {
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

  async getLatestSnapshot(): Promise<StatsSnapshot | null> {
    const query = `
      SELECT
        id,
        computed_at,
        window_start,
        window_end,
        sample_size,
        avg_ms,
        popular_hour,
        top_queries
      FROM
        stats_snapshots
      ORDER BY
        computed_at DESC
      LIMIT 1
    `;

    const result = await this.pool.query(query);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      computed_at: row.computed_at,
      window_start: row.window_start,
      window_end: row.window_end,
      sample_size: row.sample_size,
      avg_ms: parseFloat(row.avg_ms),
      popular_hour: row.popular_hour,
      top_queries: row.top_queries,
    };
  }

  async updateStatsSnapshot(): Promise<void> {
    const windowHours = config.statistics.windowHours;
    const useAllTime = windowHours <= 0;

    console.log(
      "Updating statistics snapshot for " +
        (useAllTime ? "all time" : `${windowHours} hours`)
    );

    const timeWindowClause = useAllTime
      ? `
      WITH time_window AS (
        SELECT
          COALESCE((SELECT MIN(occurred_at) FROM query_events), now()) AS window_start,
          now() AS window_end
      ),
      filtered_events AS (
        SELECT
          query_events.*
        FROM
          query_events,
          time_window
      ),
      `
      : `
      WITH time_window AS (
        SELECT
          now() - interval '${windowHours} hours' AS window_start,
          now() AS window_end
      ),
      filtered_events AS (
        SELECT
          query_events.*
        FROM
          query_events,
          time_window
        WHERE
          query_events.occurred_at >= time_window.window_start
          AND query_events.occurred_at < time_window.window_end
      ),
      `;

    const query = `${timeWindowClause}
      average_latency AS (
        SELECT
          AVG(ms)::numeric(12,3) AS average_ms,
          COUNT(*) AS total_count
        FROM
          filtered_events
      ),
      top_routes AS (
        SELECT
          route,
          COUNT(*) AS request_count
        FROM
          filtered_events
        GROUP BY
          route
        ORDER BY
          request_count DESC
        LIMIT 5
      ),
      total_requests AS (
        SELECT
          COUNT(*) AS total_count
        FROM
          filtered_events
      ),
      top_routes_with_percentage AS (
        SELECT
          top_routes.route,
          top_routes.request_count,
          (top_routes.request_count::numeric / NULLIF(total_requests.total_count, 0)) AS percentage
        FROM
          top_routes,
          total_requests
      ),
      most_popular_hour AS (
        SELECT
          EXTRACT(HOUR FROM occurred_at AT TIME ZONE 'UTC')::smallint AS hour_of_day,
          COUNT(*) AS request_count
        FROM
          filtered_events
        GROUP BY
          EXTRACT(HOUR FROM occurred_at AT TIME ZONE 'UTC')
        ORDER BY
          request_count DESC
        LIMIT 1
      )
      INSERT INTO stats_snapshots (
        window_start,
        window_end,
        sample_size,
        avg_ms,
        popular_hour,
        top_queries
      )
      SELECT
        (SELECT window_start FROM time_window),
        (SELECT window_end FROM time_window),
        (SELECT total_count FROM average_latency),
        COALESCE((SELECT average_ms FROM average_latency), 0),
        COALESCE((SELECT hour_of_day FROM most_popular_hour), 0),
        COALESCE((
          SELECT
            jsonb_agg(
              jsonb_build_object(
                'route', route,
                'count', request_count,
                'pct', COALESCE(percentage, 0)
              )
            )
          FROM
            top_routes_with_percentage
        ), '[]'::jsonb)
    `;

    await this.pool.query(query);
  }

  async initialize(): Promise<void> {
    try {
      const checkColumn = await this.pool.query(`
        SELECT column_name, is_generated
        FROM information_schema.columns
        WHERE table_name = 'query_events' AND column_name = 'hour_of_day'
      `);

      if (
        checkColumn.rows.length > 0 &&
        checkColumn.rows[0].is_generated === "ALWAYS"
      ) {
        console.log("Dropping old generated column hour_of_day...");
        await this.pool.query(
          "ALTER TABLE query_events DROP COLUMN IF EXISTS hour_of_day"
        );
        await this.pool.query("DROP INDEX IF EXISTS qe_hour_btree");
      }
    } catch (error) {
      console.log("Table check completed (might not exist yet)");
    }

    const migrationSQL = `
      CREATE TABLE IF NOT EXISTS query_events (
        id            bigserial PRIMARY KEY,
        occurred_at   timestamptz NOT NULL DEFAULT now(),
        path          text        NOT NULL,
        route         text        NOT NULL,
        ms            integer     NOT NULL,
        source        text        NOT NULL DEFAULT 'starwars'
      );

      CREATE INDEX IF NOT EXISTS qe_occurred_at_brin ON query_events USING BRIN (occurred_at);
      CREATE INDEX IF NOT EXISTS qe_route_btree      ON query_events (route);
      CREATE INDEX IF NOT EXISTS qe_hour_btree       ON query_events ((EXTRACT(HOUR FROM occurred_at AT TIME ZONE 'UTC')));
      CREATE INDEX IF NOT EXISTS qe_route_time       ON query_events (route, occurred_at);

      CREATE TABLE IF NOT EXISTS stats_snapshots (
        id              bigserial PRIMARY KEY,
        computed_at     timestamptz NOT NULL DEFAULT now(),
        window_start    timestamptz NOT NULL,
        window_end      timestamptz NOT NULL,
        sample_size     integer     NOT NULL,
        avg_ms          numeric(12,3) NOT NULL,
        popular_hour    smallint     NOT NULL,
        top_queries     jsonb        NOT NULL
      );

      CREATE INDEX IF NOT EXISTS ss_computed_at ON stats_snapshots (computed_at DESC);
    `;

    await this.pool.query(migrationSQL);
    console.log("Database initialized");
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

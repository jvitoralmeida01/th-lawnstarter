-- Raw events from StarwarsService publisher
CREATE TABLE IF NOT EXISTS query_events (
  id            bigserial PRIMARY KEY,
  occurred_at   timestamptz NOT NULL DEFAULT now(),
  path          text        NOT NULL,   -- e.g. "/films", "/films/1", "/people/3"
  route         text        NOT NULL,   -- normalized template you group by, e.g. "/films", "/films/:id", "/people/:id"
  ms            integer     NOT NULL,   -- latency in ms
  source        text        NOT NULL DEFAULT 'starwars', -- if you want; easy filter/extension
  hour_of_day   smallint    GENERATED ALWAYS AS (EXTRACT(HOUR FROM occurred_at)) STORED
);

-- Indexing for append-only time series + grouping
CREATE INDEX IF NOT EXISTS qe_occurred_at_brin ON query_events USING BRIN (occurred_at);
CREATE INDEX IF NOT EXISTS qe_route_btree      ON query_events (route);
CREATE INDEX IF NOT EXISTS qe_hour_btree       ON query_events (hour_of_day);
CREATE INDEX IF NOT EXISTS qe_route_time       ON query_events (route, occurred_at);

-- 5-minute snapshot (rollup) table
CREATE TABLE IF NOT EXISTS stats_snapshots (
  id              bigserial PRIMARY KEY,
  computed_at     timestamptz NOT NULL DEFAULT now(),
  window_start    timestamptz NOT NULL,   -- e.g., now() - interval '24 hours' (or whatever window you choose)
  window_end      timestamptz NOT NULL,   -- usually now()
  sample_size     integer     NOT NULL,   -- #events used
  avg_ms          numeric(12,3) NOT NULL, -- overall avg latency
  popular_hour    smallint     NOT NULL,  -- 0..23
  top_queries     jsonb        NOT NULL   -- [{route:"/films", pct:0.34, count:123}, ... up to 5]
);

CREATE INDEX IF NOT EXISTS ss_computed_at ON stats_snapshots (computed_at DESC);


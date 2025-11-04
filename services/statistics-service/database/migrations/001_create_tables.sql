-- Create sequences for auto-incrementing IDs
CREATE SEQUENCE IF NOT EXISTS query_events_id_seq;
CREATE SEQUENCE IF NOT EXISTS stats_snapshots_id_seq;

-- Create query_events table
CREATE TABLE IF NOT EXISTS public.query_events (
    id BIGINT NOT NULL DEFAULT nextval('query_events_id_seq'::regclass),
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    path TEXT NOT NULL,
    route TEXT NOT NULL,
    ms INTEGER NOT NULL,
    source TEXT NOT NULL DEFAULT 'starwars'::text,
    CONSTRAINT query_events_pkey PRIMARY KEY (id)
);

-- Create indexes for query_events
CREATE INDEX IF NOT EXISTS qe_hour_btree ON public.query_events USING btree (EXTRACT(hour FROM (occurred_at AT TIME ZONE 'UTC'::text)));
CREATE INDEX IF NOT EXISTS qe_occurred_at_brin ON public.query_events USING brin (occurred_at);
CREATE INDEX IF NOT EXISTS qe_route_btree ON public.query_events USING btree (route);
CREATE INDEX IF NOT EXISTS qe_route_time ON public.query_events USING btree (route, occurred_at);

-- Create stats_snapshots table
CREATE TABLE IF NOT EXISTS public.stats_snapshots (
    id BIGINT NOT NULL DEFAULT nextval('stats_snapshots_id_seq'::regclass),
    computed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    sample_size INTEGER NOT NULL,
    avg_ms NUMERIC(12,3) NOT NULL,
    popular_hour SMALLINT NOT NULL,
    top_queries JSONB NOT NULL,
    CONSTRAINT stats_snapshots_pkey PRIMARY KEY (id)
);

-- Create indexes for stats_snapshots
CREATE INDEX IF NOT EXISTS ss_computed_at ON public.stats_snapshots USING btree (computed_at DESC);


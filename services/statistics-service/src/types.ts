export interface QueryEvent {
  path: string;
  route: string;
  ms: number;
  source?: string;
  occurred_at?: string; // timestamp
}

export interface TopQuery {
  query: string;
  percentage: number;
}

export interface AverageRequestTime {
  averageTimeMs: number;
}

export interface PopularTime {
  hour: string;
  requestCount: number;
}

export interface StatsSnapshot {
  id: number;
  computed_at: Date;
  window_start: Date;
  window_end: Date;
  sample_size: number;
  avg_ms: number;
  popular_hour: number;
  top_queries: Array<{
    route: string;
    count: number;
    pct: number;
  }>;
}

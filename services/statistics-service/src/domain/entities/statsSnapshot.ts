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

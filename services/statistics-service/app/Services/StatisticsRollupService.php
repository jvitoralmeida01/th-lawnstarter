<?php

namespace App\Services;

use App\Models\StatsSnapshot;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class StatisticsRollupService
{
    /**
     * Compute and store statistics snapshot for the last 24 hours
     */
    public function rollupStatistics(): void
    {
        try {
            $windowStart = Carbon::now()->subHours(24);
            $windowEnd = Carbon::now();

            Log::info('Starting statistics rollup', [
                'window_start' => $windowStart->toIso8601String(),
                'window_end' => $windowEnd->toIso8601String(),
            ]);

            $result = $this->computeStatistics($windowStart, $windowEnd);

            StatsSnapshot::create([
                'computed_at' => Carbon::now(),
                'window_start' => $windowStart,
                'window_end' => $windowEnd,
                'sample_size' => $result['sample_size'],
                'avg_ms' => $result['avg_ms'],
                'popular_hour' => $result['popular_hour'],
                'popular_hour_count' => $result['popular_hour_count'],
                'top_queries' => $result['top_queries'],
            ]);

            Log::info('Statistics rollup completed successfully', [
                'sample_size' => $result['sample_size'],
            ]);
        } catch (\Exception $e) {
            Log::error('Error during statistics rollup', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Compute statistics using raw SQL with descriptive CTEs
     */
    private function computeStatistics(Carbon $windowStart, Carbon $windowEnd): array
    {
        $sql = "
            WITH window_boundaries AS (
                SELECT
                    :window_start::timestamptz AS window_start_time,
                    :window_end::timestamptz AS window_end_time
            ),
            filtered_events AS (
                SELECT
                    query_events.*
                FROM query_events, window_boundaries
                WHERE query_events.occurred_at >= window_boundaries.window_start_time
                  AND query_events.occurred_at < window_boundaries.window_end_time
            ),
            average_computation AS (
                SELECT
                    AVG(filtered_events.ms)::numeric(12,3) AS average_ms,
                    COUNT(*) AS event_count
                FROM filtered_events
            ),
            route_aggregation AS (
                SELECT
                    filtered_events.route,
                    COUNT(*) AS route_count
                FROM filtered_events
                GROUP BY filtered_events.route
                ORDER BY route_count DESC
                LIMIT 5
            ),
            total_count AS (
                SELECT COUNT(*) AS total_events
                FROM filtered_events
            ),
            route_with_percentages AS (
                SELECT
                    route_aggregation.route,
                    route_aggregation.route_count,
                    CASE
                        WHEN total_count.total_events > 0
                        THEN (route_aggregation.route_count::numeric / total_count.total_events)
                        ELSE 0
                    END AS percentage
                FROM route_aggregation, total_count
            ),
            hour_aggregation AS (
                SELECT
                    filtered_events.hour_of_day,
                    COUNT(*) AS hour_count
                FROM filtered_events
                GROUP BY filtered_events.hour_of_day
                ORDER BY hour_count DESC
                LIMIT 1
            ),
            popular_hour_count AS (
                SELECT
                    COUNT(*) AS request_count
                FROM filtered_events
                WHERE filtered_events.hour_of_day = (SELECT hour_of_day FROM hour_aggregation)
            )
            SELECT
                (SELECT average_ms FROM average_computation) AS avg_ms,
                (SELECT event_count FROM average_computation) AS sample_size,
                COALESCE((SELECT hour_of_day FROM hour_aggregation), 0) AS popular_hour,
                COALESCE((SELECT request_count FROM popular_hour_count), 0) AS popular_hour_count,
                (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'query', route,
                            'requestCount', route_count,
                            'pct', percentage
                        ) ORDER BY route_count DESC
                    )
                    FROM route_with_percentages
                ) AS top_queries,
                (SELECT window_start_time FROM window_boundaries) AS window_start,
                (SELECT window_end_time FROM window_boundaries) AS window_end
        ";

        $result = DB::selectOne($sql, [
            'window_start' => $windowStart->toIso8601String(),
            'window_end' => $windowEnd->toIso8601String(),
        ]);

        return [
            'avg_ms' => (float) $result->avg_ms,
            'sample_size' => (int) $result->sample_size,
            'popular_hour' => (int) $result->popular_hour,
            'popular_hour_count' => (int) ($result->popular_hour_count ?? 0),
            'top_queries' => json_decode($result->top_queries ?? '[]', true) ?: [],
        ];
    }
}


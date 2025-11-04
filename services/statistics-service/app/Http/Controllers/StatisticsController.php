<?php

namespace App\Http\Controllers;

use App\Models\StatsSnapshot;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class StatisticsController extends Controller
{
    /**
     * Get top queries statistics
     */
    public function topQueries(): JsonResponse
    {
        try {
            $snapshot = StatsSnapshot::latest();

            if (!$snapshot) {
                return response()->json([
                    'message' => 'No statistics available yet',
                    'result' => [
                        'queries' => [],
                    ],
                ]);
            }

            $queries = collect($snapshot->top_queries)->map(function ($item) {
                return [
                    'query' => $item['query'] ?? '',
                    'requestCount' => $item['requestCount'] ?? 0,
                ];
            })->values()->toArray();

            return response()->json([
                'message' => 'Top queries retrieved successfully',
                'result' => [
                    'queries' => $queries,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving top queries', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error retrieving top queries',
                'result' => [
                    'queries' => [],
                ],
            ], 500);
        }
    }

    /**
     * Get average request time statistics
     */
    public function averageRequestTime(): JsonResponse
    {
        try {
            $snapshot = StatsSnapshot::latest();

            if (!$snapshot) {
                return response()->json([
                    'message' => 'No statistics available yet',
                    'result' => [
                        'averageTimeMs' => 0,
                    ],
                ]);
            }

            return response()->json([
                'message' => 'Average request time retrieved successfully',
                'result' => [
                    'averageTimeMs' => (int) round($snapshot->avg_ms),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving average request time', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error retrieving average request time',
                'result' => [
                    'averageTimeMs' => 0,
                ],
            ], 500);
        }
    }

    /**
     * Get popular time statistics
     */
    public function popularTime(): JsonResponse
    {
        try {
            $snapshot = StatsSnapshot::latest();

            if (!$snapshot) {
                return response()->json([
                    'message' => 'No statistics available yet',
                    'result' => [
                        'hour' => '00',
                        'requestCount' => 0,
                    ],
                ]);
            }

            return response()->json([
                'message' => 'Popular time retrieved successfully',
                'result' => [
                    'hour' => str_pad((string) $snapshot->popular_hour, 2, '0', STR_PAD_LEFT),
                    'requestCount' => $snapshot->popular_hour_count ?? 0,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving popular time', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error retrieving popular time',
                'result' => [
                    'hour' => '00',
                    'requestCount' => 0,
                ],
            ], 500);
        }
    }
}


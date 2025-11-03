<?php

namespace App\Http\Controllers;

use App\Services\CacheService;
use App\Services\ResponseTransformer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatisticsController extends Controller
{
    private const POLICY = [
        'Cache-Control' => 'public, s-maxage=300, max-age=60, stale-while-revalidate=0, stale-if-error=600',
        'Vary' => 'Accept-Encoding',
    ];

    public function __construct(
        private CacheService $cacheService,
        private ResponseTransformer $transformer
    ) {}

    public function index(Request $request): JsonResponse
    {
        $statisticsBase = config('services.statistics.base_url');
        $upstreamUrl = "{$statisticsBase}/api/";
        $cacheKeyPrefix = "statistics:";

        $topQueriesSuffix = 'top-queries';
        $averageRequestTimeSuffix = 'average-request-time';
        $popularTimeSuffix = 'popular-time';

        $topQueriesResult = null;
        $averageRequestTimeResult = null;
        $popularTimeResult = null;
        $successCount = 0;

        try {
            $topQueriesResult = $this->cacheService->cachedGet($cacheKeyPrefix.$topQueriesSuffix, $upstreamUrl.$topQueriesSuffix, self::POLICY);
            $successCount++;
        } catch (\Exception $e) {
            $topQueriesResult = null;
        }

        try {
            $averageRequestTimeResult = $this->cacheService->cachedGet($cacheKeyPrefix.$averageRequestTimeSuffix, $upstreamUrl.$averageRequestTimeSuffix, self::POLICY);
            $successCount++;
        } catch (\Exception $e) {
            $averageRequestTimeResult = null;
        }

        try {
            $popularTimeResult = $this->cacheService->cachedGet($cacheKeyPrefix.$popularTimeSuffix, $upstreamUrl.$popularTimeSuffix, self::POLICY);
            $successCount++;
        } catch (\Exception $e) {
            $popularTimeResult = null;
        }

        if ($successCount === 3) {
            $message = 'All statistics returned successfully';
        } elseif ($successCount > 0) {
            $message = 'Some statistics did not return successfully';
        } else {
            $message = 'No statistics returned successfully';
        }

        $transformed = $this->transformer->transformStatistics(
            $topQueriesResult['body'] ?? ["message" => "Top queries was not returned successfully", "result" => []],
            $averageRequestTimeResult['body'] ?? ["message" => "Average request time was not returned successfully", "result" => (object)[]],
            $popularTimeResult['body'] ?? ["message" => "Popular time was not returned successfully", "result" => (object)[]]
        );

        $response = response()->json([
            'message' => $message,
            'result' => $transformed,
        ]);

        if (
             (isset($popularTimeResult['headers']['Warning']) && $popularTimeResult['headers']['Warning'] === '110 - "Response is Stale"')
          || (isset($averageRequestTimeResult['headers']['Warning']) && $averageRequestTimeResult['headers']['Warning'] === '110 - "Response is Stale"')
          || (isset($topQueriesResult['headers']['Warning']) && $topQueriesResult['headers']['Warning'] === '110 - "Response is Stale"')
        ) {
            $response->header('Warning', '110 - "Response is Stale"');
        }

        return $response;
    }
}


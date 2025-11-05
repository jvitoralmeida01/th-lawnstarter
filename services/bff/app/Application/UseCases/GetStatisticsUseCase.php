<?php

namespace App\Application\UseCases;

use App\Application\Ports\StatisticsRepository;
use App\Services\ResponseTransformer;

class GetStatisticsUseCase
{
    private const POLICY = [
        'Cache-Control' => 'public, s-maxage=300, max-age=60, stale-while-revalidate=0, stale-if-error=600',
        'Vary' => 'Accept-Encoding',
    ];

    public function __construct(
        private StatisticsRepository $statisticsRepository,
        private ResponseTransformer $transformer
    ) {}

    public function execute(): array
    {
        $topQueriesResult = $this->statisticsRepository->getTopQueries(self::POLICY);
        $averageRequestTimeResult = $this->statisticsRepository->getAverageRequestTime(self::POLICY);
        $popularTimeResult = $this->statisticsRepository->getPopularTime(self::POLICY);

        $successCount = 0;
        if ($topQueriesResult !== null) $successCount++;
        if ($averageRequestTimeResult !== null) $successCount++;
        if ($popularTimeResult !== null) $successCount++;

        if ($successCount === 3) {
            $message = 'All statistics returned successfully';
        } elseif ($successCount > 0) {
            $message = 'Some statistics did not return successfully';
        } else {
            $message = 'No statistics returned successfully';
        }

        $transformed = $this->transformer->transformStatistics(
            $topQueriesResult?->body ?? ["message" => "Top queries was not returned successfully", "result" => []],
            $averageRequestTimeResult?->body ?? ["message" => "Average request time was not returned successfully", "result" => (object)[]],
            $popularTimeResult?->body ?? ["message" => "Popular time was not returned successfully", "result" => (object)[]]
        );

        $headers = [];
        if (
            ($popularTimeResult && isset($popularTimeResult->headers['Warning']) && $popularTimeResult->headers['Warning'] === '110 - "Response is Stale"')
            || ($averageRequestTimeResult && isset($averageRequestTimeResult->headers['Warning']) && $averageRequestTimeResult->headers['Warning'] === '110 - "Response is Stale"')
            || ($topQueriesResult && isset($topQueriesResult->headers['Warning']) && $topQueriesResult->headers['Warning'] === '110 - "Response is Stale"')
        ) {
            $headers['Warning'] = '110 - "Response is Stale"';
        }

        return [
            'body' => [
                'message' => $message,
                'result' => $transformed,
            ],
            'headers' => $headers,
        ];
    }
}


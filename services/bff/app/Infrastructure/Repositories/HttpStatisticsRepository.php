<?php

namespace App\Infrastructure\Repositories;

use App\Application\Ports\CacheRepository;
use App\Application\Ports\StatisticsRepository;
use App\Domain\Entities\StatisticsItem;

class HttpStatisticsRepository implements StatisticsRepository
{
    public function __construct(
        private CacheRepository $cacheRepository
    ) {}

    public function getTopQueries(array $policyHeaders): ?StatisticsItem
    {
        try {
            $statisticsBase = config('services.statistics.base_url');
            $upstreamUrl = "{$statisticsBase}/api/top-queries";
            $cacheKey = "statistics:top-queries";

            $result = $this->cacheRepository->cachedGet($cacheKey, $upstreamUrl, $policyHeaders);

            return new StatisticsItem($result['body'], $result['headers']);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function getAverageRequestTime(array $policyHeaders): ?StatisticsItem
    {
        try {
            $statisticsBase = config('services.statistics.base_url');
            $upstreamUrl = "{$statisticsBase}/api/average-request-time";
            $cacheKey = "statistics:average-request-time";

            $result = $this->cacheRepository->cachedGet($cacheKey, $upstreamUrl, $policyHeaders);

            return new StatisticsItem($result['body'], $result['headers']);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function getPopularTime(array $policyHeaders): ?StatisticsItem
    {
        try {
            $statisticsBase = config('services.statistics.base_url');
            $upstreamUrl = "{$statisticsBase}/api/popular-time";
            $cacheKey = "statistics:popular-time";

            $result = $this->cacheRepository->cachedGet($cacheKey, $upstreamUrl, $policyHeaders);

            return new StatisticsItem($result['body'], $result['headers']);
        } catch (\Exception $e) {
            return null;
        }
    }
}


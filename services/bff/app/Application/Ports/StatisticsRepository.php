<?php

namespace App\Application\Ports;

use App\Domain\Entities\StatisticsItem;

interface StatisticsRepository
{
    public function getTopQueries(array $policyHeaders): ?StatisticsItem;
    public function getAverageRequestTime(array $policyHeaders): ?StatisticsItem;
    public function getPopularTime(array $policyHeaders): ?StatisticsItem;
}


<?php

namespace App\Domain\Entities;

class Statistics
{
    public function __construct(
        public readonly ?StatisticsItem $topQueries,
        public readonly ?StatisticsItem $averageRequestTime,
        public readonly ?StatisticsItem $popularTime
    ) {}
}


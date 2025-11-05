<?php

namespace App\Domain\Entities;

class StatisticsItem
{
    public function __construct(
        public readonly array $body,
        public readonly array $headers
    ) {}
}


<?php

namespace App\Domain\Entities;

class SearchResult
{
    public function __construct(
        public readonly array $results
    ) {}
}


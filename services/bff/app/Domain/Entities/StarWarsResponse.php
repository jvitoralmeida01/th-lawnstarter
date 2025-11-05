<?php

namespace App\Domain\Entities;

class StarWarsResponse
{
    public function __construct(
        public readonly array $body,
        public readonly array $headers
    ) {}
}


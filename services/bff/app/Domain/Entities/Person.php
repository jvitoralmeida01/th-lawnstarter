<?php

namespace App\Domain\Entities;

class Person
{
    public function __construct(
        public readonly array $data
    ) {}
}


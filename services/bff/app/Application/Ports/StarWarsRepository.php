<?php

namespace App\Application\Ports;

use App\Domain\Entities\StarWarsResponse;

interface StarWarsRepository
{
    public function getFilm(string $id, array $policyHeaders): StarWarsResponse;
    public function getPerson(string $id, array $policyHeaders): StarWarsResponse;
    public function search(string $query, string $entityTypes, array $policyHeaders): StarWarsResponse;
}


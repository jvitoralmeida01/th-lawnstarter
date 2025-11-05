<?php

namespace App\Infrastructure\Repositories;

use App\Application\Ports\CacheRepository;
use App\Application\Ports\StarWarsRepository;
use App\Domain\Entities\StarWarsResponse;

class HttpStarWarsRepository implements StarWarsRepository
{
    public function __construct(
        private CacheRepository $cacheRepository
    ) {}

    public function getFilm(string $id, array $policyHeaders): StarWarsResponse
    {
        $starwarsBase = config('services.starwars.base_url');
        $upstreamUrl = "{$starwarsBase}/api/films/{$id}";
        $cacheKey = "films:{$id}";

        $result = $this->cacheRepository->cachedGet($cacheKey, $upstreamUrl, $policyHeaders);

        return new StarWarsResponse($result['body'], $result['headers']);
    }

    public function getPerson(string $id, array $policyHeaders): StarWarsResponse
    {
        $starwarsBase = config('services.starwars.base_url');
        $upstreamUrl = "{$starwarsBase}/api/people/{$id}";
        $cacheKey = "people:{$id}";

        $result = $this->cacheRepository->cachedGet($cacheKey, $upstreamUrl, $policyHeaders);

        return new StarWarsResponse($result['body'], $result['headers']);
    }

    public function search(string $query, string $entityTypes, array $policyHeaders): StarWarsResponse
    {
        $starwarsBase = config('services.starwars.base_url');
        $params = http_build_query([
            'query' => $query,
            'entityTypes' => $entityTypes,
        ]);
        $upstreamUrl = "{$starwarsBase}/api/search?{$params}";
        $cacheKey = "search:query={$query}&entityTypes={$entityTypes}";

        $result = $this->cacheRepository->cachedGet($cacheKey, $upstreamUrl, $policyHeaders);

        return new StarWarsResponse($result['body'], $result['headers']);
    }
}


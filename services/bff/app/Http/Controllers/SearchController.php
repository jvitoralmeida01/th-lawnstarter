<?php

namespace App\Http\Controllers;

use App\Services\CacheService;
use App\Services\ResponseTransformer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    private const POLICY = [
        'Cache-Control' => 'public, s-maxage=3600, max-age=30, stale-while-revalidate=0, stale-if-error=600',
        'Vary' => 'Accept-Encoding',
    ];

    public function __construct(
        private CacheService $cacheService,
        private ResponseTransformer $transformer
    ) {}

    public function search(Request $request): JsonResponse
    {
        $query = $request->query('query', '');
        $entityTypes = $request->query('entityTypes', []);

        if (is_string($entityTypes)) {
            $entityTypes = explode(',', $entityTypes);
        }

        $starwarsBase = config('services.starwars.base_url');
        $params = http_build_query([
            'query' => $query,
            'entityTypes' => is_array($entityTypes) ? implode(',', $entityTypes) : $entityTypes,
        ]);
        $upstreamUrl = "{$starwarsBase}/api/search?{$params}";
        $cacheKey = "search:query={$query}&entityTypes=" . (is_array($entityTypes) ? implode(',', $entityTypes) : $entityTypes);

        $result = $this->cacheService->cachedGet($cacheKey, $upstreamUrl, self::POLICY);

        $transformed = $this->transformer->transformSearchResults($result['body']['result']);

        $response = response()->json([
            'message' => $result['body']['message'],
            'result' => $transformed,
        ]);

        // Set cache headers
        foreach ($result['headers'] as $name => $value) {
            $response->header($name, $value);
        }

        return $response;
    }
}


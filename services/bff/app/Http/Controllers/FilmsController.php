<?php

namespace App\Http\Controllers;

use App\Services\CacheService;
use App\Services\ResponseTransformer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FilmsController extends Controller
{
    private const POLICY = [
        'Cache-Control' => 'public, s-maxage=3600, max-age=300, stale-while-revalidate=0, stale-if-error=600',
        'Vary' => 'Accept-Encoding',
    ];

    public function __construct(
        private CacheService $cacheService,
        private ResponseTransformer $transformer
    ) {}

    public function show(Request $request, string $id): JsonResponse
    {
        $starwarsBase = config('services.starwars.base_url');
        $upstreamUrl = "{$starwarsBase}/api/films/{$id}";
        $cacheKey = "films:{$id}";

        $result = $this->cacheService->cachedGet($cacheKey, $upstreamUrl, self::POLICY);

        $transformed = $this->transformer->transformFilm($result['body']['result']);

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


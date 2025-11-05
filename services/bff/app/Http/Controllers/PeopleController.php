<?php

namespace App\Http\Controllers;

use App\Services\CacheService;
use App\Services\ResponseTransformer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PeopleController extends Controller
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
        if (empty($id)) {
            return response()->json([
                'message' => 'Person ID is required',
            ], 400);
        }

        $starwarsBase = config('services.starwars.base_url');
        $upstreamUrl = "{$starwarsBase}/api/people/{$id}";
        $cacheKey = "people:{$id}";

        $result = $this->cacheService->cachedGet($cacheKey, $upstreamUrl, self::POLICY);

        $transformed = $this->transformer->transformPerson($result['body']['result']);

        $response = response()->json([
            'message' => $result['body']['message'],
            'result' => $transformed,
        ]);

        foreach ($result['headers'] as $name => $value) {
            $response->header($name, $value);
        }

        return $response;
    }
}


<?php

namespace App\Application\UseCases;

use App\Application\Ports\StarWarsRepository;
use App\Services\ResponseTransformer;

class SearchUseCase
{
    private const POLICY = [
        'Cache-Control' => 'public, s-maxage=3600, max-age=30, stale-while-revalidate=0, stale-if-error=600',
        'Vary' => 'Accept-Encoding',
    ];

    public function __construct(
        private StarWarsRepository $starWarsRepository,
        private ResponseTransformer $transformer
    ) {}

    public function execute(string $query, string $entityTypes): array
    {
        $response = $this->starWarsRepository->search($query, $entityTypes, self::POLICY);

        $transformed = $this->transformer->transformSearchResults($response->body['result']);

        return [
            'body' => [
                'message' => $response->body['message'],
                'result' => $transformed,
            ],
            'headers' => $response->headers,
        ];
    }
}


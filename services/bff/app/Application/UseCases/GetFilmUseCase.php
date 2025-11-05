<?php

namespace App\Application\UseCases;

use App\Application\Ports\StarWarsRepository;
use App\Domain\Entities\Film;
use App\Services\ResponseTransformer;

class GetFilmUseCase
{
    private const POLICY = [
        'Cache-Control' => 'public, s-maxage=3600, max-age=300, stale-while-revalidate=0, stale-if-error=600',
        'Vary' => 'Accept-Encoding',
    ];

    public function __construct(
        private StarWarsRepository $starWarsRepository,
        private ResponseTransformer $transformer
    ) {}

    public function execute(string $id): array
    {
        $response = $this->starWarsRepository->getFilm($id, self::POLICY);

        $transformed = $this->transformer->transformFilm($response->body['result']);

        return [
            'body' => [
                'message' => $response->body['message'],
                'result' => $transformed,
            ],
            'headers' => $response->headers,
        ];
    }
}


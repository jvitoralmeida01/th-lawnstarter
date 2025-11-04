<?php

namespace Tests\Unit\Services;

use App\Services\ResponseTransformer;
use Tests\TestCase;

class ResponseTransformerTest extends TestCase
{
    private ResponseTransformer $transformer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->transformer = new ResponseTransformer();
    }

    public function test_transform_film_changes_film_to_name(): void
    {
        $film = [
            'id' => 1,
            'title' => 'A New Hope',
            'openingCrawl' => 'It is a period of civil war...',
            'characters' => ['character1', 'character2'],
        ];

        $result = $this->transformer->transformFilm($film);

        $this->assertArrayHasKey('name', $result);
        $this->assertEquals('A New Hope', $result['name']);
        $this->assertArrayNotHasKey('title', $result);
        $this->assertEquals(1, $result['id']);
        $this->assertEquals('It is a period of civil war...', $result['openingCrawl']);
        $this->assertEquals(['character1', 'character2'], $result['characters']);
    }

    public function test_transform_statistics_aggregates_all_inner_statistics_with_messages(): void
    {
        $topQueriesResponse = [
            'message' => 'Top queries retrieved successfully',
            'result' => [
                ['query' => 'luke', 'count' => 10],
                ['query' => 'leia', 'count' => 8],
            ],
        ];

        $averageRequestTimeResponse = [
            'message' => 'Average request time calculated successfully',
            'result' => ['averageTime' => 125.5],
        ];

        $popularTimeResponse = [
            'message' => 'Popular time retrieved successfully',
            'result' => ['hour' => 14, 'count' => 42],
        ];

        $result = $this->transformer->transformStatistics(
            $topQueriesResponse,
            $averageRequestTimeResponse,
            $popularTimeResponse
        );

        $this->assertArrayHasKey('topQueries', $result);
        $this->assertArrayHasKey('averageRequestTime', $result);
        $this->assertArrayHasKey('popularTime', $result);

        $this->assertEquals($topQueriesResponse, $result['topQueries']);
        $this->assertEquals($averageRequestTimeResponse, $result['averageRequestTime']);
        $this->assertEquals($popularTimeResponse, $result['popularTime']);

        // Verify messages are preserved
        $this->assertEquals('Top queries retrieved successfully', $result['topQueries']['message']);
        $this->assertEquals('Average request time calculated successfully', $result['averageRequestTime']['message']);
        $this->assertEquals('Popular time retrieved successfully', $result['popularTime']['message']);
    }
}

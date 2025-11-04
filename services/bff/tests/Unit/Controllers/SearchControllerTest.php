<?php

namespace Tests\Unit\Controllers;

use App\Http\Controllers\SearchController;
use App\Services\CacheService;
use App\Services\ResponseTransformer;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;
use Mockery;
use Mockery\MockInterface;
use ReflectionClass;

class SearchControllerTest extends TestCase
{
    private SearchController $controller;
    private MockInterface $cacheService;
    private MockInterface $transformer;

    protected function setUp(): void
    {
        parent::setUp();
        $cacheService = Mockery::mock(CacheService::class);
        $transformer = Mockery::mock(ResponseTransformer::class);
        /** @phpstan-ignore-next-line */
        $this->cacheService = $cacheService;
        /** @phpstan-ignore-next-line */
        $this->transformer = $transformer;
        $this->controller = new SearchController($cacheService, $transformer);

        Config::set('services.starwars.base_url', 'http://test-starwars.local');
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_headers_are_passed_through_from_upstream(): void
    {
        $request = Request::create('/api/search', 'GET', [
            'query' => 'luke',
            'entityTypes' => 'films,people',
        ]);

        $headers = [
            'Cache-Control' => 'public, s-maxage=3600',
            'ETag' => '"test-etag"',
            'Vary' => 'Accept-Encoding',
        ];

        $this->cacheService->shouldReceive('cachedGet')
            ->once()
            ->andReturn([
                'body' => ['message' => 'Success', 'result' => []],
                'headers' => $headers,
            ]);

        $this->transformer->shouldReceive('transformSearchResults')
            ->once()
            ->andReturn([]);

        $response = $this->controller->search($request);

        $this->assertEquals('public, s-maxage=3600', $response->headers->get('Cache-Control'));
        $this->assertEquals('"test-etag"', $response->headers->get('ETag'));
        $this->assertEquals('Accept-Encoding', $response->headers->get('Vary'));
    }

    public function test_cache_key_is_set_correctly(): void
    {
        $request = Request::create('/api/search', 'GET', [
            'query' => 'luke',
            'entityTypes' => 'films,people',
        ]);

        $reflection = new ReflectionClass(SearchController::class);
        $policy = $reflection->getConstant('POLICY');

        $this->cacheService->shouldReceive('cachedGet')
            ->once()
            ->with(
                'search:query=luke&entityTypes=films,people',
                'http://test-starwars.local/api/search?query=luke&entityTypes=films%2Cpeople',
                $policy
            )
            ->andReturn([
                'body' => ['message' => 'Success', 'result' => []],
                'headers' => [],
            ]);

        $this->transformer->shouldReceive('transformSearchResults')
            ->once()
            ->andReturn([]);

        $response = $this->controller->search($request);

        $this->assertNotNull($response);
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('message', $responseData);
    }

    public function test_only_exact_entity_types_in_request_are_used_to_build_cache_key(): void
    {
        $request = Request::create('/api/search', 'GET', [
            'query' => 'luke',
            'entityTypes' => ['films', 'people'],
        ]);

        $reflection = new ReflectionClass(SearchController::class);
        $policy = $reflection->getConstant('POLICY');

        $this->cacheService->shouldReceive('cachedGet')
            ->once()
            ->with(
                'search:query=luke&entityTypes=films,people',
                Mockery::pattern('/entityTypes=films%2Cpeople/'),
                $policy
            )
            ->andReturn([
                'body' => ['message' => 'Success', 'result' => []],
                'headers' => [],
            ]);

        $this->transformer->shouldReceive('transformSearchResults')
            ->once()
            ->andReturn([]);

        $response = $this->controller->search($request);

        $this->assertNotNull($response);
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('message', $responseData);
    }

    public function test_cached_get_throws_exception(): void
    {
        $request = Request::create('/api/search', 'GET', [
            'query' => 'luke',
            'entityTypes' => 'films',
        ]);

        $this->cacheService->shouldReceive('cachedGet')
            ->once()
            ->andThrow(new HttpResponseException(
                response()->json(['message' => 'Upstream service unavailable'], 503)
            ));

        $this->expectException(HttpResponseException::class);

        $this->controller->search($request);
    }

    public function test_response_is_in_expected_format(): void
    {
        $request = Request::create('/api/search', 'GET', [
            'query' => 'luke',
            'entityTypes' => 'films',
        ]);

        $upstreamBody = [
            'message' => 'Success',
            'result' => ['films' => [], 'people' => []],
        ];

        $this->cacheService->shouldReceive('cachedGet')
            ->once()
            ->andReturn([
                'body' => $upstreamBody,
                'headers' => ['Cache-Control' => 'public, s-maxage=3600'],
            ]);

        $this->transformer->shouldReceive('transformSearchResults')
            ->once()
            ->andReturn(['films' => [], 'people' => []]);

        $response = $this->controller->search($request);

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('message', $responseData);
        $this->assertArrayHasKey('result', $responseData);
        $this->assertIsArray($responseData['result']);
    }

    public function test_empty_query_returns_400_status_code(): void
    {
        $request = Request::create('/api/search', 'GET', [
            'query' => '',
            'entityTypes' => 'films',
        ]);

        $response = $this->controller->search($request);

        $this->assertEquals(400, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Query is required', $responseData['message']);
    }

    public function test_empty_entity_types_returns_400_status_code(): void
    {
        $request = Request::create('/api/search', 'GET', [
            'query' => 'luke',
            'entityTypes' => '',
        ]);

        $response = $this->controller->search($request);

        $this->assertEquals(400, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Entity types are required', $responseData['message']);
    }
}

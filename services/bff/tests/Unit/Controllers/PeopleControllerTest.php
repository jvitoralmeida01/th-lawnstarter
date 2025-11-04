<?php

namespace Tests\Unit\Controllers;

use App\Http\Controllers\PeopleController;
use App\Services\CacheService;
use App\Services\ResponseTransformer;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;
use Mockery;
use Mockery\MockInterface;
use ReflectionClass;

class PeopleControllerTest extends TestCase
{
    private PeopleController $controller;
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
        $this->controller = new PeopleController($cacheService, $transformer);

        Config::set('services.starwars.base_url', 'http://test-starwars.local');
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_message_passes_through_from_upstream(): void
    {
        $request = new Request();
        $id = '1';

        $upstreamBody = [
            'message' => 'Person retrieved successfully',
            'result' => [
                'id' => 1,
                'name' => 'Luke Skywalker',
            ],
        ];

        $reflection = new ReflectionClass(PeopleController::class);
        $policy = $reflection->getConstant('POLICY');

        $this->cacheService->shouldReceive('cachedGet')
            ->once()
            ->with('people:1', 'http://test-starwars.local/people/1', $policy)
            ->andReturn([
                'body' => $upstreamBody,
                'headers' => ['Cache-Control' => 'public, s-maxage=3600'],
            ]);

        $this->transformer->shouldReceive('transformPerson')
            ->once()
            ->with($upstreamBody['result'])
            ->andReturn($upstreamBody['result']);

        $response = $this->controller->show($request, $id);

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Person retrieved successfully', $responseData['message']);
    }

    public function test_response_is_in_expected_format(): void
    {
        $request = new Request();
        $id = '1';

        $upstreamBody = [
            'message' => 'Success',
            'result' => ['id' => 1, 'name' => 'Luke Skywalker'],
        ];

        $this->cacheService->shouldReceive('cachedGet')
            ->once()
            ->andReturn([
                'body' => $upstreamBody,
                'headers' => ['Cache-Control' => 'public, s-maxage=3600'],
            ]);

        $this->transformer->shouldReceive('transformPerson')
            ->once()
            ->andReturn(['id' => 1, 'name' => 'Luke Skywalker']);

        $response = $this->controller->show($request, $id);

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('message', $responseData);
        $this->assertArrayHasKey('result', $responseData);
        $this->assertIsArray($responseData['result']);
    }

    public function test_headers_are_passed_through_from_upstream(): void
    {
        $request = new Request();
        $id = '1';

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

        $this->transformer->shouldReceive('transformPerson')
            ->once()
            ->andReturn([]);

        $response = $this->controller->show($request, $id);

        $this->assertEquals('public, s-maxage=3600', $response->headers->get('Cache-Control'));
        $this->assertEquals('"test-etag"', $response->headers->get('ETag'));
        $this->assertEquals('Accept-Encoding', $response->headers->get('Vary'));
    }

    public function test_cache_key_is_set_correctly(): void
    {
        $request = new Request();
        $id = '42';

        $reflection = new ReflectionClass(PeopleController::class);
        $policy = $reflection->getConstant('POLICY');

        $this->cacheService->shouldReceive('cachedGet')
            ->once()
            ->with('people:42', 'http://test-starwars.local/people/42', $policy)
            ->andReturn([
                'body' => ['message' => 'Success', 'result' => []],
                'headers' => [],
            ]);

        $this->transformer->shouldReceive('transformPerson')
            ->once()
            ->andReturn([]);

        $response = $this->controller->show($request, $id);

        $this->assertNotNull($response);
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Success', $responseData['message']);
    }

    public function test_cached_get_throws_exception(): void
    {
        $request = new Request();
        $id = '1';

        $this->cacheService->shouldReceive('cachedGet')
            ->once()
            ->andThrow(new HttpResponseException(
                response()->json(['message' => 'Upstream service unavailable'], 503)
            ));

        $this->expectException(HttpResponseException::class);

        $this->controller->show($request, $id);
    }

    public function test_empty_id_returns_400_status_code(): void
    {
        $request = new Request();
        $id = '';

        $response = $this->controller->show($request, $id);

        $this->assertEquals(400, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Person ID is required', $responseData['message']);
    }
}

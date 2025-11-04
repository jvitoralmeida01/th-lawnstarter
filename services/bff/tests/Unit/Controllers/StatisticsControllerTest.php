<?php

namespace Tests\Unit\Controllers;

use App\Http\Controllers\StatisticsController;
use App\Services\CacheService;
use App\Services\ResponseTransformer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;
use Mockery;
use Mockery\MockInterface;
use ReflectionClass;

class StatisticsControllerTest extends TestCase
{
    private StatisticsController $controller;
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
        $this->controller = new StatisticsController($cacheService, $transformer);

        Config::set('services.statistics.base_url', 'http://test-statistics.local');
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_all_statistics_returned_successfully(): void
    {
        $request = new Request();

        $topQueriesResult = [
            'body' => ['message' => 'Top queries retrieved successfully', 'result' => []],
            'headers' => [],
        ];

        $averageRequestTimeResult = [
            'body' => ['message' => 'Average request time retrieved successfully', 'result' => (object)[]],
            'headers' => [],
        ];

        $popularTimeResult = [
            'body' => ['message' => 'Popular time retrieved successfully', 'result' => (object)[]],
            'headers' => [],
        ];

        $reflection = new ReflectionClass(StatisticsController::class);
        $policy = $reflection->getConstant('POLICY');

        $this->cacheService->shouldReceive('cachedGet')
            ->once()
            ->with('statistics:top-queries', 'http://test-statistics.local/api/top-queries', $policy)
            ->andReturn($topQueriesResult);

        $this->cacheService->shouldReceive('cachedGet')
            ->once()
            ->with('statistics:average-request-time', 'http://test-statistics.local/api/average-request-time', $policy)
            ->andReturn($averageRequestTimeResult);

        $this->cacheService->shouldReceive('cachedGet')
            ->once()
            ->with('statistics:popular-time', 'http://test-statistics.local/api/popular-time', $policy)
            ->andReturn($popularTimeResult);

        $this->transformer->shouldReceive('transformStatistics')
            ->once()
            ->with(
                $topQueriesResult['body'],
                $averageRequestTimeResult['body'],
                $popularTimeResult['body']
            )
            ->andReturn([
                'topQueries' => $topQueriesResult['body'],
                'averageRequestTime' => $averageRequestTimeResult['body'],
                'popularTime' => $popularTimeResult['body'],
            ]);

        $response = $this->controller->index($request);

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('All statistics returned successfully', $responseData['message']);
    }

    public function test_all_statistics_returned_successfully_with_correct_inner_messages(): void
    {
        $request = new Request();

        $topQueriesResult = [
            'body' => ['message' => 'Top queries retrieved successfully', 'result' => []],
            'headers' => [],
        ];

        $averageRequestTimeResult = [
            'body' => ['message' => 'Average request time retrieved successfully', 'result' => (object)[]],
            'headers' => [],
        ];

        $popularTimeResult = [
            'body' => ['message' => 'Popular time retrieved successfully', 'result' => (object)[]],
            'headers' => [],
        ];

        $this->cacheService->shouldReceive('cachedGet')
            ->times(3)
            ->andReturn($topQueriesResult, $averageRequestTimeResult, $popularTimeResult);

        $this->transformer->shouldReceive('transformStatistics')
            ->once()
            ->andReturn([
                'topQueries' => $topQueriesResult['body'],
                'averageRequestTime' => $averageRequestTimeResult['body'],
                'popularTime' => $popularTimeResult['body'],
            ]);

        $response = $this->controller->index($request);

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('All statistics returned successfully', $responseData['message']);
        $this->assertEquals('Top queries retrieved successfully', $responseData['result']['topQueries']['message']);
        $this->assertEquals('Average request time retrieved successfully', $responseData['result']['averageRequestTime']['message']);
        $this->assertEquals('Popular time retrieved successfully', $responseData['result']['popularTime']['message']);
    }

    public function test_some_statistics_did_not_return_successfully(): void
    {
        $request = new Request();

        $topQueriesResult = [
            'body' => ['message' => 'Top queries retrieved successfully', 'result' => []],
            'headers' => [],
        ];

        $reflection = new ReflectionClass(StatisticsController::class);
        $policy = $reflection->getConstant('POLICY');

        $this->cacheService->shouldReceive('cachedGet')
            ->once()
            ->with('statistics:top-queries', 'http://test-statistics.local/api/top-queries', $policy)
            ->andReturn($topQueriesResult);

        $this->cacheService->shouldReceive('cachedGet')
            ->once()
            ->with('statistics:average-request-time', 'http://test-statistics.local/api/average-request-time', $policy)
            ->andThrow(new \Exception('Service unavailable'));

        $this->cacheService->shouldReceive('cachedGet')
            ->once()
            ->with('statistics:popular-time', 'http://test-statistics.local/api/popular-time', $policy)
            ->andThrow(new \Exception('Service unavailable'));

        $this->transformer->shouldReceive('transformStatistics')
            ->once()
            ->with(
                $topQueriesResult['body'],
                ["message" => "Average request time was not returned successfully", "result" => (object)[]],
                ["message" => "Popular time was not returned successfully", "result" => (object)[]]
            )
            ->andReturn([
                'topQueries' => $topQueriesResult['body'],
                'averageRequestTime' => ["message" => "Average request time was not returned successfully", "result" => (object)[]],
                'popularTime' => ["message" => "Popular time was not returned successfully", "result" => (object)[]],
            ]);

        $response = $this->controller->index($request);

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Some statistics did not return successfully', $responseData['message']);
    }

    public function test_no_statistics_returned_successfully(): void
    {
        $request = new Request();

        $this->cacheService->shouldReceive('cachedGet')
            ->times(3)
            ->andThrow(new \Exception('Service unavailable'));

        $this->transformer->shouldReceive('transformStatistics')
            ->once()
            ->with(
                ["message" => "Top queries was not returned successfully", "result" => []],
                ["message" => "Average request time was not returned successfully", "result" => (object)[]],
                ["message" => "Popular time was not returned successfully", "result" => (object)[]]
            )
            ->andReturn([
                'topQueries' => ["message" => "Top queries was not returned successfully", "result" => []],
                'averageRequestTime' => ["message" => "Average request time was not returned successfully", "result" => (object)[]],
                'popularTime' => ["message" => "Popular time was not returned successfully", "result" => (object)[]],
            ]);

        $response = $this->controller->index($request);

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('No statistics returned successfully', $responseData['message']);
    }

    public function test_response_is_in_expected_format(): void
    {
        $request = new Request();

        $result = [
            'body' => ['message' => 'Success', 'result' => []],
            'headers' => [],
        ];

        $this->cacheService->shouldReceive('cachedGet')
            ->times(3)
            ->andReturn($result);

        $this->transformer->shouldReceive('transformStatistics')
            ->once()
            ->andReturn([
                'topQueries' => [],
                'averageRequestTime' => (object)[],
                'popularTime' => (object)[],
            ]);

        $response = $this->controller->index($request);

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('message', $responseData);
        $this->assertArrayHasKey('result', $responseData);
        $this->assertArrayHasKey('topQueries', $responseData['result']);
        $this->assertArrayHasKey('averageRequestTime', $responseData['result']);
        $this->assertArrayHasKey('popularTime', $responseData['result']);
    }

    public function test_headers_are_passed_through_when_stale_warning_exists(): void
    {
        $request = new Request();

        $topQueriesResult = [
            'body' => ['message' => 'Success', 'result' => []],
            'headers' => ['Warning' => '110 - "Response is Stale"'],
        ];

        $averageRequestTimeResult = [
            'body' => ['message' => 'Success', 'result' => (object)[]],
            'headers' => [],
        ];

        $popularTimeResult = [
            'body' => ['message' => 'Success', 'result' => (object)[]],
            'headers' => [],
        ];

        $this->cacheService->shouldReceive('cachedGet')
            ->times(3)
            ->andReturn($topQueriesResult, $averageRequestTimeResult, $popularTimeResult);

        $this->transformer->shouldReceive('transformStatistics')
            ->once()
            ->andReturn([
                'topQueries' => [],
                'averageRequestTime' => (object)[],
                'popularTime' => (object)[],
            ]);

        $response = $this->controller->index($request);

        $this->assertEquals('110 - "Response is Stale"', $response->headers->get('Warning'));
    }

    public function test_cache_key_is_set_correctly(): void
    {
        $request = new Request();

        $result = [
            'body' => ['message' => 'Success', 'result' => []],
            'headers' => [],
        ];

        $reflection = new ReflectionClass(StatisticsController::class);
        $policy = $reflection->getConstant('POLICY');

        $this->cacheService->shouldReceive('cachedGet')
            ->once()
            ->with('statistics:top-queries', 'http://test-statistics.local/api/top-queries', $policy)
            ->andReturn($result);

        $this->cacheService->shouldReceive('cachedGet')
            ->once()
            ->with('statistics:average-request-time', 'http://test-statistics.local/api/average-request-time', $policy)
            ->andReturn($result);

        $this->cacheService->shouldReceive('cachedGet')
            ->once()
            ->with('statistics:popular-time', 'http://test-statistics.local/api/popular-time', $policy)
            ->andReturn($result);

        $this->transformer->shouldReceive('transformStatistics')
            ->once()
            ->andReturn([
                'topQueries' => [],
                'averageRequestTime' => (object)[],
                'popularTime' => (object)[],
            ]);

        $response = $this->controller->index($request);

        $this->assertNotNull($response);
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('All statistics returned successfully', $responseData['message']);
    }
}

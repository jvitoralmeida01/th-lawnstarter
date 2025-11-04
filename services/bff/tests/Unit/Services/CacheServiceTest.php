<?php

namespace Tests\Unit\Services;

use App\Services\CacheService;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;
use ReflectionClass;
use ReflectionMethod;

class CacheServiceTest extends TestCase
{
    private CacheService $cacheService;
    private ReflectionClass $reflection;

    protected function setUp(): void
    {
        parent::setUp();
        Http::fake(function ($request) {
            return Http::response(['error' => 'Default fake'], 404);
        });
        $this->cacheService = new CacheService();
        $this->reflection = new ReflectionClass(CacheService::class);
    }

    protected function tearDown(): void
    {
        Cache::flush();
        Http::fake([]);
        parent::tearDown();
    }

    private function invokePrivateMethod(string $methodName, ...$args)
    {
        $method = $this->reflection->getMethod($methodName);
        $method->setAccessible(true);
        return $method->invoke($this->cacheService, ...$args);
    }

    public function test_read_cache_directive_returns_correct_value(): void
    {
        $cacheControl = 'public, s-maxage=3600, stale-if-error=7200';

        $smax = $this->invokePrivateMethod('readCacheDirective', $cacheControl, 's-maxage');
        $this->assertEquals(3600, $smax);

        $sie = $this->invokePrivateMethod('readCacheDirective', $cacheControl, 'stale-if-error');
        $this->assertEquals(7200, $sie);

        // Test non-existent directive
        $maxAge = $this->invokePrivateMethod('readCacheDirective', $cacheControl, 'max-age');
        $this->assertEquals(0, $maxAge);
    }

    public function test_make_weak_etag_called_twice_with_same_body_returns_same_value(): void
    {
        $body = ['id' => 1, 'name' => 'Test'];

        $etag1 = $this->invokePrivateMethod('makeWeakEtag', $body);
        $etag2 = $this->invokePrivateMethod('makeWeakEtag', $body);

        $this->assertEquals($etag1, $etag2);
        $this->assertStringStartsWith('W/"', $etag1);
        $this->assertStringEndsWith('"', $etag1);
    }

    public function test_extract_header_returns_correct_value(): void
    {
        $headers = [
            'Cache-Control' => 'public, s-maxage=3600',
            'ETag' => '"test-etag"',
            'Vary' => ['Accept-Encoding', 'Accept-Language'],
        ];

        $cacheControl = $this->invokePrivateMethod('extractHeader', $headers, 'Cache-Control');
        $this->assertEquals('public, s-maxage=3600', $cacheControl);

        // Test array header (should return first element)
        $vary = $this->invokePrivateMethod('extractHeader', $headers, 'Vary');
        $this->assertEquals('Accept-Encoding', $vary);

        // Test non-existent header
        $missing = $this->invokePrivateMethod('extractHeader', $headers, 'Missing-Header');
        $this->assertNull($missing);
    }

    public function test_resolve_cache_control_prioritizes_upstream_cache_policy_over_parameter_policy(): void
    {
        $upstreamHeaders = [
            'Cache-Control' => 'public, s-maxage=3600',
        ];

        $policyHeaders = [
            'Cache-Control' => 'public, s-maxage=1800',
        ];

        $result = $this->invokePrivateMethod('resolveCacheControl', $upstreamHeaders, $policyHeaders);
        $this->assertEquals('public, s-maxage=3600', $result);

        // Test fallback to policy headers when upstream doesn't provide Cache-Control
        $upstreamHeadersNoCache = [];
        $resultFallback = $this->invokePrivateMethod('resolveCacheControl', $upstreamHeadersNoCache, $policyHeaders);
        $this->assertEquals('public, s-maxage=1800', $resultFallback);

        // Test default fallback
        $resultDefault = $this->invokePrivateMethod('resolveCacheControl', [], []);
        $this->assertEquals('public, max-age=0', $resultDefault);
    }

    public function test_is_fresh_function_correctly_identifies_if_cache_is_fresh(): void
    {
        $nowMs = 1000000;
        $storedAtMs = 990000; // 10 seconds ago (10000ms)

        $entry = [
            'storedAt' => $storedAtMs,
            'headers' => [
                'Cache-Control' => 'public, s-maxage=20', // 20 seconds
            ],
        ];

        $isFresh = $this->invokePrivateMethod('isFresh', $entry, $nowMs);
        $this->assertTrue($isFresh);

        // Test stale entry
        $entryStale = [
            'storedAt' => 980000, // 20 seconds ago
            'headers' => [
                'Cache-Control' => 'public, s-maxage=10', // 10 seconds
            ],
        ];

        $isFreshStale = $this->invokePrivateMethod('isFresh', $entryStale, $nowMs);
        $this->assertFalse($isFreshStale);
    }

    public function test_within_stale_if_error_function_correctly_identifies_if_cache_is_stale_within_stale_if_error_time_window(): void
    {
        $nowMs = 1000000;

        // Entry is stale but within stale-if-error window
        $entry = [
            'storedAt' => 980000, // 20 seconds ago
            'headers' => [
                'Cache-Control' => 'public, s-maxage=10, stale-if-error=15', // 10s fresh, 15s stale-if-error
            ],
        ];

        $withinWindow = $this->invokePrivateMethod('withinStaleIfError', $entry, $nowMs);
        $this->assertTrue($withinWindow); // 20s < 10s + 15s = 25s

        // Entry is beyond stale-if-error window
        $entryBeyond = [
            'storedAt' => 960000, // 40 seconds ago
            'headers' => [
                'Cache-Control' => 'public, s-maxage=10, stale-if-error=15',
            ],
        ];

        $beyondWindow = $this->invokePrivateMethod('withinStaleIfError', $entryBeyond, $nowMs);
        $this->assertFalse($beyondWindow); // 40s > 25s

        // Entry is fresh (should still be within window)
        $entryFresh = [
            'storedAt' => 995000, // 5 seconds ago
            'headers' => [
                'Cache-Control' => 'public, s-maxage=10, stale-if-error=15',
            ],
        ];

        $withinWindowFresh = $this->invokePrivateMethod('withinStaleIfError', $entryFresh, $nowMs);
        $this->assertTrue($withinWindowFresh);
    }

    public function test_build_headers_returns_correct_headers(): void
    {
        $body = ['id' => 1, 'name' => 'Test'];
        $upstreamHeaders = [
            'ETag' => '"upstream-etag"',
            'Cache-Control' => 'public, s-maxage=3600',
            'Vary' => 'Accept-Language',
        ];
        $policyHeaders = [
            'Cache-Control' => 'public, s-maxage=1800',
            'Vary' => 'Accept-Encoding',
        ];

        $headers = $this->invokePrivateMethod('buildHeaders', $body, $upstreamHeaders, $policyHeaders);

        $this->assertArrayHasKey('Cache-Control', $headers);
        $this->assertArrayHasKey('ETag', $headers);
        $this->assertArrayHasKey('Date', $headers);
        $this->assertArrayHasKey('Vary', $headers);

        // Should prioritize upstream Cache-Control
        $this->assertEquals('public, s-maxage=3600', $headers['Cache-Control']);

        // Should use upstream ETag
        $this->assertEquals('"upstream-etag"', $headers['ETag']);

        // Should use upstream Vary
        $this->assertEquals('Accept-Language', $headers['Vary']);

        // Date should be present
        $this->assertNotNull($headers['Date']);
        $this->assertStringEndsWith(' GMT', $headers['Date']);

        // Test fallback to weak ETag when upstream doesn't provide ETag
        $headersNoEtag = $this->invokePrivateMethod('buildHeaders', $body, [], $policyHeaders);
        $this->assertStringStartsWith('W/"', $headersNoEtag['ETag']);

        // Test fallback to policy Vary
        $headersNoVary = $this->invokePrivateMethod('buildHeaders', $body, [], $policyHeaders);
        $this->assertEquals('Accept-Encoding', $headersNoVary['Vary']);

        // Test default Vary
        $headersDefault = $this->invokePrivateMethod('buildHeaders', $body, [], []);
        $this->assertEquals('Accept-Encoding', $headersDefault['Vary']);
    }

    public function test_cache_hits_fresh_entry_will_return_response_from_cache(): void
    {
        $nowMs = (int) (microtime(true) * 1000);
        $storedAtMs = $nowMs - 5000; // 5 seconds ago

        $cachedBody = ['id' => 1, 'name' => 'Cached'];
        $cachedHeaders = [
            'Cache-Control' => 'public, s-maxage=3600',
            'ETag' => '"cached-etag"',
        ];

        Cache::put('bff:cache:test-key', [
            'body' => $cachedBody,
            'headers' => $cachedHeaders,
            'storedAt' => $storedAtMs,
        ], 3600);

        $result = $this->cacheService->cachedGet(
            'test-key',
            'http://test-url.com/api/resource',
            []
        );

        $this->assertEquals($cachedBody, $result['body']);
        $this->assertEquals($cachedHeaders, $result['headers']);
    }

    public function test_cache_hit_within_stale_if_error_time_window_will_return_response_from_cache(): void
    {
        $nowMs = (int) (microtime(true) * 1000);
        $storedAtMs = $nowMs - 20000; // 20 seconds ago (stale but within stale-if-error)

        $cachedBody = ['id' => 1, 'name' => 'Stale'];
        $cachedHeaders = [
            'Cache-Control' => 'public, s-maxage=10, stale-if-error=15', // 10s fresh + 15s stale-if-error = 25s total
            'ETag' => '"stale-etag"',
        ];

        Cache::put('bff:cache:test-key', [
            'body' => $cachedBody,
            'headers' => $cachedHeaders,
            'storedAt' => $storedAtMs,
        ], 25);

        // Mock HTTP to fail (simulating upstream failure)
        Http::fake(function () {
            return Http::response(['error' => 'Service unavailable'], 503);
        });

        Log::shouldReceive('warning')->once();

        $result = $this->cacheService->cachedGet(
            'test-key',
            'http://test-url.com/api/resource',
            []
        );

        // Should return stale cache with warning header
        $this->assertEquals($cachedBody, $result['body']);
        $this->assertArrayHasKey('Warning', $result['headers']);
        $this->assertEquals('110 - "Response is Stale"', $result['headers']['Warning']);
    }

    public function test_cache_hit_outside_stale_if_error_time_window_and_fetch_failed_will_throw_exception(): void
    {
        $nowMs = (int) (microtime(true) * 1000);
        $storedAtMs = $nowMs - 50000; // 50 seconds ago (beyond stale-if-error window)

        $cachedBody = ['id' => 1, 'name' => 'Very Stale'];
        $cachedHeaders = [
            'Cache-Control' => 'public, s-maxage=10, stale-if-error=15', // 10s + 15s = 25s total
            'ETag' => '"very-stale-etag"',
        ];

        Cache::put('bff:cache:test-key', [
            'body' => $cachedBody,
            'headers' => $cachedHeaders,
            'storedAt' => $storedAtMs,
        ], 25);

        // Mock HTTP to fail
        Http::fake(function () {
            return Http::response(['error' => 'Service unavailable'], 503);
        });

        Log::shouldReceive('error')->once();

        $this->expectException(HttpResponseException::class);

        try {
            $this->cacheService->cachedGet(
                'test-key',
                'http://test-url.com/api/resource',
                []
            );
        } catch (HttpResponseException $e) {
            $response = $e->getResponse();
            $responseData = json_decode($response->getContent(), true);
            $this->assertEquals('Upstream service unavailable', $responseData['message']);
            $this->assertEquals(503, $response->getStatusCode());
            throw $e;
        }
    }
}

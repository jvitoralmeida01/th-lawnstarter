<?php


namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Log;

class CacheService
{
    private function getCacheKey(string $key): string
    {
        return "bff:cache:$key";
    }

    private function readCacheDirective(string $cacheControl, string $directive): int
    {
        if (preg_match("/{$directive}=(\d+)/", $cacheControl, $matches)) {
            return (int) $matches[1];
        }
        return 0;
    }

    private function makeWeakEtag(mixed $body): string
    {
        $hash = hash('sha256', json_encode($body));
        return 'W/"' . substr($hash, 0, 16) . '"';
    }

    private function extractHeader(array $upstreamHeaders, string $headerName): ?string
    {
        $header = $upstreamHeaders[$headerName] ?? null;
        if (is_array($header)) {
            return $header[0] ?? null;
        }
        return $header;
    }

    /**
     * Prioritize upstream cache policy over parameter policy
     */
    private function resolveCacheControl(array $upstreamHeaders, array $policyHeaders): string
    {
        $upstreamCacheControl = $this->extractHeader($upstreamHeaders, 'Cache-Control');
        if ($upstreamCacheControl) {
            return $upstreamCacheControl;
        }

        return $policyHeaders['Cache-Control'] ?? 'public, max-age=0';
    }

    private function isFresh(array $entry, int $nowMs): bool
    {
        $ageSec = (int) (($nowMs - $entry['storedAt']) / 1000);
        $smax = $this->readCacheDirective($entry['headers']['Cache-Control'], 's-maxage');
        return $ageSec <= $smax;
    }

    private function withinStaleIfError(array $entry, int $nowMs): bool
    {
        $ageSec = (int) (($nowMs - $entry['storedAt']) / 1000);
        $smax = $this->readCacheDirective($entry['headers']['Cache-Control'], 's-maxage');
        $sie = $this->readCacheDirective($entry['headers']['Cache-Control'], 'stale-if-error');
        return $ageSec <= ($smax + $sie);
    }

    private function buildHeaders(array $body, array $upstreamHeaders, array $policyHeaders): array
    {
        $etag = $this->extractHeader($upstreamHeaders, 'ETag');
        $cacheControl = $this->resolveCacheControl($upstreamHeaders, $policyHeaders);
        $headers = [
          'Cache-Control' => $cacheControl,
          'ETag' => $etag ?? $this->makeWeakEtag($body),
          'Date' => gmdate('D, d M Y H:i:s') . ' GMT',
          'Vary' => $this->extractHeader($upstreamHeaders, 'Vary') ?? $policyHeaders['Vary'] ?? 'Accept-Encoding',
      ];
      return $headers;
    }

    /**
     * Generic cached GET with stale-if-error support
     *
     * Cache policy is prioritized from upstream response headers.
     * Falls back to policyHeaders parameter if upstream doesn't provide Cache-Control.
     *
     * @param string $cacheKey Cache key
     * @param string $upstreamUrl Full upstream URL
     * @param array $policyHeaders Fallback Cache-Control and other headers to publish downstream
     * @return array Response body
     */
    public function cachedGet(string $cacheKey, string $upstreamUrl, array $policyHeaders): array
    {
        $now = (int) (microtime(true) * 1000);
        $fullKey = $this->getCacheKey($cacheKey);
        $existing = Cache::get($fullKey);

        // If cache miss: fetch > store > return
        if (!$existing) {
            try {
                $resp = Http::timeout(5)->get($upstreamUrl);

                if (!$resp->successful()) {
                    throw new \Exception("Upstream request failed with status: " . $resp->status());
                }

                $body = $resp->json();
                $headers = $this->buildHeaders($body, $resp->headers(), $policyHeaders);

                $entry = [
                    'body' => $body,
                    'headers' => $headers,
                    'storedAt' => $now,
                ];

                $smax = $this->readCacheDirective($headers['Cache-Control'], 's-maxage');
                $sie = $this->readCacheDirective($headers['Cache-Control'], 'stale-if-error');
                $ttl = $smax + $sie;

                Cache::put($fullKey, $entry, $ttl);

                return ['body' => $body, 'headers' => $headers];
            } catch (\Exception $e) {
                Log::error("Cache miss fetch failed: " . $e->getMessage());
                throw new HttpResponseException(
                    response()->json(['message' => 'Upstream service unavailable'], 503)
                );
            }
        }

        // If cache hit and the entry is fresh: return cached
        if ($this->isFresh($existing, $now)) {
            return ['body' => $existing['body'], 'headers' => $existing['headers']];
        }

        // If cache hit, but the entry is stale: attempt to fetch fresh data
        try {
            $resp = Http::timeout(5)->get($upstreamUrl);

            if (!$resp->successful()) {
                throw new \Exception("Upstream request failed with status: " . $resp->status());
            }

            $body = $resp->json();
            $headers = $this->buildHeaders($body, $resp->headers(), $policyHeaders);

            $entry = [
                'body' => $body,
                'headers' => $headers,
                'storedAt' => (int) (microtime(true) * 1000),
            ];

            $smax = $this->readCacheDirective($headers['Cache-Control'], 's-maxage');
            $sie = $this->readCacheDirective($headers['Cache-Control'], 'stale-if-error');
            $ttl = $smax + $sie;

            Cache::put($fullKey, $entry, $ttl);

            return ['body' => $body, 'headers' => $headers];
        } catch (\Exception $e) {
            // If within stale-if-error window, return stale with warning
            if ($this->withinStaleIfError($existing, $now)) {
                Log::warning("Refresh failed, returning stale: " . $e->getMessage());
                $headers = array_merge($existing['headers'], [
                    'Warning' => '110 - "Response is Stale"',
                ]);
                return ['body' => $existing['body'], 'headers' => $headers];
            }

            // If beyond stale-if-error window, propagate the error
            Log::error("Refresh failed and beyond stale-if-error window: " . $e->getMessage());
            throw new HttpResponseException(
                response()->json(['message' => 'Upstream service unavailable'], 503)
            );
        }
    }
}


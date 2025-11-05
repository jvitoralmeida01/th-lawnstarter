<?php

namespace App\Application\Ports;

interface CacheRepository
{
    /**
     * @param string $cacheKey Cache key
     * @param string $upstreamUrl Full upstream URL
     * @param array $policyHeaders Fallback Cache-Control and other headers to publish downstream
     * @return array Response with 'body' and 'headers' keys
     */
    public function cachedGet(string $cacheKey, string $upstreamUrl, array $policyHeaders): array;
}


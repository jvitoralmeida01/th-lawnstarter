import { config } from "../../config.js";

export function calculateCacheHeaders(computedAt?: Date): string {
  if (!computedAt) {
    // No snapshot exists yet -> don't cache
    return "public, max-age=0, s-maxage=0, stale-while-revalidate=0, stale-if-error=0";
  }

  const now = Date.now();
  const computedAtMs = computedAt.getTime();
  const ageSeconds = Math.floor((now - computedAtMs) / 1000);
  const scheduledIntervalSeconds =
    config.statistics.scheduledIntervalMinutes * 60;

  // max-age = time until next snapshot = scheduledInterval - age
  // ensure it's never negative
  const maxAge = Math.max(0, scheduledIntervalSeconds - ageSeconds);
  const staleIfError = Math.floor(scheduledIntervalSeconds / 2);

  return `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=0, stale-if-error=${staleIfError}`;
}

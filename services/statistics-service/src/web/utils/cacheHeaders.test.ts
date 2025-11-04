import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { calculateCacheHeaders } from "./cacheHeaders.js";

// Mock the config module
vi.mock("../../config.js", () => ({
  config: {
    statistics: {
      scheduledIntervalMinutes: 5, // Default: 5 minutes = 300 seconds
    },
  },
}));

describe("calculateCacheHeaders", () => {
  let originalDateNow: typeof Date.now;

  beforeEach(() => {
    originalDateNow = Date.now;
  });

  afterEach(() => {
    Date.now = originalDateNow;
    vi.clearAllMocks();
  });

  it("should return no-cache headers when computedAt is not provided", () => {
    const result = calculateCacheHeaders(undefined);
    expect(result).toBe(
      "public, max-age=0, s-maxage=0, stale-while-revalidate=0, stale-if-error=0"
    );
  });

  it("should return correct headers for freshly computed data", () => {
    const now = new Date("2024-01-01T12:00:00Z").getTime();
    Date.now = vi.fn(() => now);

    const computedAt = new Date("2024-01-01T12:00:00Z");
    const result = calculateCacheHeaders(computedAt);

    expect(result).toBe(
      "public, max-age=300, s-maxage=300, stale-while-revalidate=0, stale-if-error=150"
    );
  });

  it("should return max-age=0 when data age equals scheduled interval", () => {
    const now = new Date("2024-01-01T12:05:00Z").getTime();
    Date.now = vi.fn(() => now);

    const computedAt = new Date("2024-01-01T12:00:00Z");
    const result = calculateCacheHeaders(computedAt);

    expect(result).toBe(
      "public, max-age=0, s-maxage=0, stale-while-revalidate=0, stale-if-error=150"
    );
  });

  it("should return max-age=0 when data is older than scheduled interval", () => {
    const now = new Date("2024-01-01T12:10:00Z").getTime();
    Date.now = vi.fn(() => now);

    const computedAt = new Date("2024-01-01T12:00:00Z");
    const result = calculateCacheHeaders(computedAt);

    expect(result).toBe(
      "public, max-age=0, s-maxage=0, stale-while-revalidate=0, stale-if-error=150"
    );
  });

  it("should calculate stale-if-error as half of scheduled interval", () => {
    const now = new Date("2024-01-01T12:02:00Z").getTime();
    Date.now = vi.fn(() => now);

    const computedAt = new Date("2024-01-01T12:01:00Z");
    const result = calculateCacheHeaders(computedAt);

    expect(result).toContain("stale-if-error=150");
  });
});

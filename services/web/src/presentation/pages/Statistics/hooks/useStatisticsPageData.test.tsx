import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useStatisticsPageData from "./useStatisticsPageData";
import type {
  TopQueryEntity,
  AverageRequestTimeEntity,
  PopularTimeEntity,
} from "../../../../domain/entities/StatisticsEntity";
import { useGetStatisticsUseCase } from "../../../../infrastructure/di";

vi.mock("../../../../infrastructure/di", () => ({
  useGetStatisticsUseCase: vi.fn(),
}));

describe("useStatisticsPageData", () => {
  const mockExecute = vi.fn();
  const mockUseCase = {
    execute: mockExecute,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetStatisticsUseCase).mockReturnValue(
      mockUseCase as unknown as ReturnType<typeof useGetStatisticsUseCase>
    );
  });

  it("should have correct initial states", () => {
    mockExecute.mockImplementation(() => new Promise(() => {})); // Never resolves only to force keep initial state

    const { result } = renderHook(() => useStatisticsPageData());

    expect(result.current.topQueries).toEqual([]);
    expect(result.current.averageRequestTime).toBeNull();
    expect(result.current.popularTime).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("should call execute on mount and only once", async () => {
    const mockStatistics = {
      topQueries: [],
      averageRequestTime: null,
      popularTime: null,
    };
    mockExecute.mockResolvedValue(mockStatistics);

    renderHook(() => useStatisticsPageData());

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledTimes(1);
    });
  });

  it("should update states correctly on useCase success", async () => {
    const mockTopQueries: TopQueryEntity[] = [
      { query: "luke", percentage: "50" },
      { query: "vader", percentage: "30" },
    ];
    const mockAverageRequestTime: AverageRequestTimeEntity = {
      averageTimeMs: "150",
    };
    const mockPopularTime: PopularTimeEntity = {
      hour: "14",
      requestCount: "100",
    };

    const mockStatistics = {
      topQueries: mockTopQueries,
      averageRequestTime: mockAverageRequestTime,
      popularTime: mockPopularTime,
    };

    mockExecute.mockResolvedValue(mockStatistics);

    const { result } = renderHook(() => useStatisticsPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.topQueries).toEqual(mockTopQueries);
    expect(result.current.averageRequestTime).toEqual(mockAverageRequestTime);
    expect(result.current.popularTime).toEqual(mockPopularTime);
    expect(result.current.error).toBeNull();
  });

  it("should update states correctly on useCase error", async () => {
    const errorMessage = "Failed to fetch statistics";
    mockExecute.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useStatisticsPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.topQueries).toEqual([]);
    expect(result.current.averageRequestTime).toBeNull();
    expect(result.current.popularTime).toBeNull();
    expect(result.current.error).toBe(errorMessage);
  });

  it("should handle non-Error rejection", async () => {
    mockExecute.mockRejectedValue("String error");

    const { result } = renderHook(() => useStatisticsPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to load statistics");
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpStatisticsRepository } from "./HttpStatisticsRepository";
import { BffAxiosClient, BffEndpoints } from "../BffAxiosClient";
import type { StatisticsEntity } from "../../domain/entities/StatisticsEntity";

vi.mock("../BffAxiosClient", () => ({
  BffAxiosClient: {
    get: vi.fn(),
  },
  BffEndpoints: {
    Statistics: "/statistics",
  },
}));

describe("HttpStatisticsRepository", () => {
  let repository: HttpStatisticsRepository;

  beforeEach(() => {
    repository = new HttpStatisticsRepository();
    vi.clearAllMocks();
  });

  it("should successfully fetch statistics when axios response is successful", async () => {
    // success axios response
    const mockStatistics: StatisticsEntity = {
      topQueries: [
        {
          query: "luke",
          percentage: 45.5,
        },
        {
          query: "darth",
          percentage: 30.2,
        },
      ],
      averageRequestTime: {
        averageTimeMs: 123.45,
      },
      popularTime: {
        hour: "14",
        requestCount: 150,
      },
    };

    const mockResponse = {
      status: 200,
      data: {
        message: "Success",
        result: mockStatistics,
      },
    };

    vi.mocked(BffAxiosClient.get).mockResolvedValue(mockResponse);

    const result = await repository.getStatistics();

    expect(BffAxiosClient.get).toHaveBeenCalledWith(BffEndpoints.Statistics);
    expect(result).toEqual(mockStatistics);
  });

  it("should throw an error when axios response status is not 200", async () => {
    // error axios response
    const mockResponse = {
      status: 503,
      data: {
        message: "Service unavailable",
        result: null,
      },
    };

    vi.mocked(BffAxiosClient.get).mockResolvedValue(mockResponse);

    await expect(repository.getStatistics()).rejects.toThrow(
      "Service unavailable"
    );
    expect(BffAxiosClient.get).toHaveBeenCalledWith(BffEndpoints.Statistics);
  });

  it("should throw a default error message when response status is not 200 and no message is provided", async () => {
    const mockResponse = {
      status: 500,
      data: {
        message: "",
        result: null,
      },
    };

    vi.mocked(BffAxiosClient.get).mockResolvedValue(mockResponse);

    await expect(repository.getStatistics()).rejects.toThrow(
      "Failed to fetch statistics"
    );
  });
});

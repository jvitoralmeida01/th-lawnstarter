import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpSearchRepository } from "./HttpSearchRepository";
import { BffAxiosClient, BffEndpoints } from "../BffAxiosClient";
import type { SearchResultEntity } from "../../domain/entities/SearchResultEntity";
import { SearchResultEntityType } from "../../domain/entities/SearchResultEntity";

vi.mock("../BffAxiosClient", () => ({
  BffAxiosClient: {
    get: vi.fn(),
  },
  BffEndpoints: {
    Search: "/search",
  },
}));

describe("HttpSearchRepository", () => {
  let repository: HttpSearchRepository;

  beforeEach(() => {
    repository = new HttpSearchRepository();
    vi.clearAllMocks();
  });

  it("should successfully fetch search results when axios response is successful", async () => {
    // success axios response
    const mockSearchResults: SearchResultEntity[] = [
      {
        id: "1",
        name: "Luke Skywalker",
        type: SearchResultEntityType.Person,
      },
      {
        id: "2",
        name: "A New Hope",
        type: SearchResultEntityType.Film,
      },
    ];

    const mockResponse = {
      status: 200,
      data: {
        message: "Success",
        result: mockSearchResults,
      },
    };

    vi.mocked(BffAxiosClient.get).mockResolvedValue(mockResponse);

    const result = await repository.getMany("luke", [
      SearchResultEntityType.Person,
      SearchResultEntityType.Film,
    ]);

    expect(BffAxiosClient.get).toHaveBeenCalledWith(
      `${BffEndpoints.Search}/luke`,
      {
        params: {
          entityTypes: [
            SearchResultEntityType.Person,
            SearchResultEntityType.Film,
          ],
        },
      }
    );
    expect(result).toEqual(mockSearchResults);
  });

  it("should throw an error when axios response status is not 200", async () => {
    // error axios response
    const mockResponse = {
      status: 500,
      data: {
        message: "Internal server error",
        result: null,
      },
    };

    vi.mocked(BffAxiosClient.get).mockResolvedValue(mockResponse);

    await expect(
      repository.getMany("test", [SearchResultEntityType.Person])
    ).rejects.toThrow("Internal server error");
    expect(BffAxiosClient.get).toHaveBeenCalledWith(
      `${BffEndpoints.Search}/test`,
      {
        params: {
          entityTypes: [SearchResultEntityType.Person],
        },
      }
    );
  });

  it("should throw a default error message when response status is not 200 and no message is provided", async () => {
    const mockResponse = {
      status: 400,
      data: {
        message: "",
        result: null,
      },
    };

    vi.mocked(BffAxiosClient.get).mockResolvedValue(mockResponse);

    await expect(
      repository.getMany("test", [SearchResultEntityType.Film])
    ).rejects.toThrow("Failed to search");
  });
});

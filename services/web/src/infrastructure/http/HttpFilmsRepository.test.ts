import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpFilmsRepository } from "./HttpFilmsRepository";
import { BffAxiosClient, BffEndpoints } from "../BffAxiosClient";
import type { FilmDetailsEntity } from "../../domain/entities/FilmEntity";

vi.mock("../BffAxiosClient", () => ({
  BffAxiosClient: {
    get: vi.fn(),
  },
  BffEndpoints: {
    Films: "/films",
  },
}));

describe("HttpFilmsRepository", () => {
  let repository: HttpFilmsRepository;

  beforeEach(() => {
    repository = new HttpFilmsRepository();
    vi.clearAllMocks();
  });

  it("should successfully fetch film details when axios response is successful", async () => {
    // success axios response
    const mockFilmDetails: FilmDetailsEntity = {
      id: "1",
      name: "A New Hope",
      openingCrawl: "It is a period of civil war...",
      characters: [
        {
          id: "1",
          name: "Luke Skywalker",
        },
      ],
    };

    const mockResponse = {
      status: 200,
      data: {
        message: "Success",
        result: mockFilmDetails,
      },
    };

    vi.mocked(BffAxiosClient.get).mockResolvedValue(mockResponse);

    const result = await repository.getById("1");

    expect(BffAxiosClient.get).toHaveBeenCalledWith(`${BffEndpoints.Films}/1`);
    expect(result).toEqual(mockFilmDetails);
  });

  it("should throw an error when axios response status is not 200", async () => {
    // error axios response
    const mockResponse = {
      status: 404,
      data: {
        message: "Film not found",
        result: null,
      },
    };

    vi.mocked(BffAxiosClient.get).mockResolvedValue(mockResponse);

    await expect(repository.getById("999")).rejects.toThrow("Film not found");
    expect(BffAxiosClient.get).toHaveBeenCalledWith(
      `${BffEndpoints.Films}/999`
    );
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

    await expect(repository.getById("1")).rejects.toThrow(
      "Failed to fetch film details"
    );
  });
});

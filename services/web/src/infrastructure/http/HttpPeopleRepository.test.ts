import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpPeopleRepository } from "./HttpPeopleRepository";
import { BffAxiosClient, BffEndpoints } from "../BffAxiosClient";
import type { PersonDetailsEntity } from "../../domain/entities/PersonEntity";

vi.mock("../BffAxiosClient", () => ({
  BffAxiosClient: {
    get: vi.fn(),
  },
  BffEndpoints: {
    People: "/people",
  },
}));

describe("HttpPeopleRepository", () => {
  let repository: HttpPeopleRepository;

  beforeEach(() => {
    repository = new HttpPeopleRepository();
    vi.clearAllMocks();
  });

  it("should successfully fetch person details when axios response is successful", async () => {
    // success axios response
    const mockPersonDetails: PersonDetailsEntity = {
      id: "1",
      name: "Luke Skywalker",
      birthYear: "19BBY",
      gender: "male",
      eyeColor: "blue",
      hairColor: "blond",
      height: 172,
      mass: 77,
      films: [
        {
          id: "1",
          name: "A New Hope",
        },
      ],
    };

    const mockResponse = {
      status: 200,
      data: {
        message: "Success",
        result: mockPersonDetails,
      },
    };

    vi.mocked(BffAxiosClient.get).mockResolvedValue(mockResponse);

    const result = await repository.getById("1");

    expect(BffAxiosClient.get).toHaveBeenCalledWith(`${BffEndpoints.People}/1`);
    expect(result).toEqual(mockPersonDetails);
  });

  it("should throw an error when axios response status is not 200", async () => {
    // error axios response
    const mockResponse = {
      status: 404,
      data: {
        message: "Person not found",
        result: null,
      },
    };

    vi.mocked(BffAxiosClient.get).mockResolvedValue(mockResponse);

    await expect(repository.getById("999")).rejects.toThrow("Person not found");
    expect(BffAxiosClient.get).toHaveBeenCalledWith(
      `${BffEndpoints.People}/999`
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
      "Failed to fetch person details"
    );
  });
});

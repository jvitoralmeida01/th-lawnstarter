import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import usePeoplePageData from "./usePeoplePageData";
import type { PersonDetailsEntity } from "../../../../domain/entities/PersonEntity";
import { useGetPersonDetailsByIdUseCase } from "../../../../infrastructure/di";

vi.mock("../../../../infrastructure/di", () => ({
  useGetPersonDetailsByIdUseCase: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

import { useParams } from "react-router-dom";

describe("usePeoplePageData", () => {
  const mockExecute = vi.fn();
  const mockUseCase = {
    execute: mockExecute,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetPersonDetailsByIdUseCase).mockReturnValue(
      mockUseCase as unknown as ReturnType<
        typeof useGetPersonDetailsByIdUseCase
      >
    );
  });

  // Ensure the initial states
  it("should have correct initial states", () => {
    vi.mocked(useParams).mockReturnValue({ id: "1" });
    mockExecute.mockImplementation(() => new Promise(() => {})); // Never resolves to keep initial state

    const { result } = renderHook(() => usePeoplePageData());

    expect(result.current.person).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  // Ensure useEffect is called when the component is mounted and whenever the id changes
  it("should call execute on mount when id is provided", async () => {
    vi.mocked(useParams).mockReturnValue({ id: "1" });

    const mockPerson: PersonDetailsEntity = {
      id: "1",
      name: "Luke Skywalker",
      birthYear: "19BBY",
      gender: "male",
      eyeColor: "blue",
      hairColor: "blond",
      height: 172,
      mass: 77,
      films: [],
    };

    mockExecute.mockResolvedValue(mockPerson);

    renderHook(() => usePeoplePageData());

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledTimes(1);
      expect(mockExecute).toHaveBeenCalledWith("1");
    });
  });

  it("should call execute again when id changes", async () => {
    vi.mocked(useParams).mockReturnValue({ id: "1" });

    const mockPerson1: PersonDetailsEntity = {
      id: "1",
      name: "Luke Skywalker",
      birthYear: "19BBY",
      gender: "male",
      eyeColor: "blue",
      hairColor: "blond",
      height: 172,
      mass: 77,
      films: [],
    };

    const mockPerson2: PersonDetailsEntity = {
      id: "2",
      name: "Darth Vader",
      birthYear: "41.9BBY",
      gender: "male",
      eyeColor: "yellow",
      hairColor: "none",
      height: 202,
      mass: 136,
      films: [],
    };

    mockExecute
      .mockResolvedValueOnce(mockPerson1)
      .mockResolvedValueOnce(mockPerson2);

    const { rerender } = renderHook(() => usePeoplePageData());

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledTimes(1);
      expect(mockExecute).toHaveBeenCalledWith("1");
    });

    // Change id and rerender
    vi.mocked(useParams).mockReturnValue({ id: "2" });
    rerender();

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledTimes(2);
      expect(mockExecute).toHaveBeenCalledWith("2");
    });
  });

  it("should not call execute when id is undefined", async () => {
    vi.mocked(useParams).mockReturnValue({});

    const { result } = renderHook(() => usePeoplePageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockExecute).not.toHaveBeenCalled();
    expect(result.current.personId).toBeUndefined();
  });

  // Test the states on useCase success
  it("should update states correctly on useCase success", async () => {
    vi.mocked(useParams).mockReturnValue({ id: "1" });

    const mockPerson: PersonDetailsEntity = {
      id: "1",
      name: "Luke Skywalker",
      birthYear: "19BBY",
      gender: "male",
      eyeColor: "blue",
      hairColor: "blond",
      height: 172,
      mass: 77,
      films: [],
    };

    mockExecute.mockResolvedValue(mockPerson);

    const { result } = renderHook(() => usePeoplePageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.person).toEqual(mockPerson);
    expect(result.current.personId).toBe("1");
    expect(result.current.error).toBeNull();
  });

  // Test the states on useCase error
  it("should update states correctly on useCase error", async () => {
    vi.mocked(useParams).mockReturnValue({ id: "1" });

    const errorMessage = "Failed to fetch person";
    mockExecute.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => usePeoplePageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.person).toBeNull();
    expect(result.current.error).toBe(errorMessage);
  });

  it("should handle non-Error rejection", async () => {
    vi.mocked(useParams).mockReturnValue({ id: "1" });

    mockExecute.mockRejectedValue("String error");

    const { result } = renderHook(() => usePeoplePageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to load person");
  });
});

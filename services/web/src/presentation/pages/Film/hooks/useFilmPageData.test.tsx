import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useFilmPageData from "./useFilmPageData";
import type { FilmDetailsEntity } from "../../../../domain/entities/FilmEntity";
import { useGetFilmDetailsByIdUseCase } from "../../../../infrastructure/di";

vi.mock("../../../../infrastructure/di", () => ({
  useGetFilmDetailsByIdUseCase: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

import { useParams } from "react-router-dom";

describe("useFilmPageData", () => {
  const mockExecute = vi.fn();
  const mockUseCase = {
    execute: mockExecute,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetFilmDetailsByIdUseCase).mockReturnValue(
      mockUseCase as unknown as ReturnType<typeof useGetFilmDetailsByIdUseCase>
    );
  });

  // Ensure the initial states
  it("should have correct initial states", () => {
    vi.mocked(useParams).mockReturnValue({ id: "1" });
    mockExecute.mockImplementation(() => new Promise(() => {})); // Never resolves to keep initial state

    const { result } = renderHook(() => useFilmPageData());

    expect(result.current.film).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  // Ensure useEffect is called when the component is mounted and whenever the id changes
  it("should call execute on mount when id is provided", async () => {
    vi.mocked(useParams).mockReturnValue({ id: "1" });

    const mockFilm: FilmDetailsEntity = {
      id: "1",
      name: "A New Hope",
      openingCrawl: "It is a period of civil war...",
      characters: [],
    };

    mockExecute.mockResolvedValue(mockFilm);

    renderHook(() => useFilmPageData());

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledTimes(1);
      expect(mockExecute).toHaveBeenCalledWith("1");
    });
  });

  it("should call execute again when id changes", async () => {
    vi.mocked(useParams).mockReturnValue({ id: "1" });

    const mockFilm1: FilmDetailsEntity = {
      id: "1",
      name: "A New Hope",
      openingCrawl: "It is a period of civil war...",
      characters: [],
    };

    const mockFilm2: FilmDetailsEntity = {
      id: "2",
      name: "The Empire Strikes Back",
      openingCrawl: "It is a dark time for the Rebellion...",
      characters: [],
    };

    mockExecute
      .mockResolvedValueOnce(mockFilm1)
      .mockResolvedValueOnce(mockFilm2);

    const { rerender } = renderHook(() => useFilmPageData());

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

    const { result } = renderHook(() => useFilmPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockExecute).not.toHaveBeenCalled();
    expect(result.current.filmId).toBeUndefined();
  });

  // Test the states on useCase success
  it("should update states correctly on useCase success", async () => {
    vi.mocked(useParams).mockReturnValue({ id: "1" });

    const mockFilm: FilmDetailsEntity = {
      id: "1",
      name: "A New Hope",
      openingCrawl: "It is a period of civil war...",
      characters: [],
    };

    mockExecute.mockResolvedValue(mockFilm);

    const { result } = renderHook(() => useFilmPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.film).toEqual(mockFilm);
    expect(result.current.filmId).toBe("1");
    expect(result.current.error).toBeNull();
  });

  // Test the states on useCase error
  it("should update states correctly on useCase error", async () => {
    vi.mocked(useParams).mockReturnValue({ id: "1" });

    const errorMessage = "Failed to fetch film";
    mockExecute.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useFilmPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.film).toBeNull();
    expect(result.current.error).toBe(errorMessage);
  });

  it("should handle non-Error rejection", async () => {
    vi.mocked(useParams).mockReturnValue({ id: "1" });

    mockExecute.mockRejectedValue("String error");

    const { result } = renderHook(() => useFilmPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to load film");
  });
});

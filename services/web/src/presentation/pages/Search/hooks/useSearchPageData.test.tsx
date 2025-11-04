import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import useSearchPageData from "./useSearchPageData";
import { SearchResultEntityType } from "../../../../domain/entities/SearchResultEntity";
import type { SearchResultEntity } from "../../../../domain/entities/SearchResultEntity";
import { useGetSearchResultsUseCase } from "../../../../infrastructure/di";

vi.mock("../../../../infrastructure/di", () => ({
  useGetSearchResultsUseCase: vi.fn(),
}));

describe("useSearchPageData", () => {
  const mockExecute = vi.fn();
  const mockUseCase = {
    execute: mockExecute,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetSearchResultsUseCase).mockReturnValue(
      mockUseCase as unknown as ReturnType<typeof useGetSearchResultsUseCase>
    );
  });

  it("should have correct initial states", () => {
    const { result } = renderHook(() => useSearchPageData());

    expect(result.current.searchTerm).toBe("");
    expect(result.current.searchPlaceholder).toBe(
      "e.g. Chewbacca, Yoda, Boba Fett"
    );
    expect(result.current.selectedTypes).toEqual([
      SearchResultEntityType.People,
    ]);
    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("should update searchPlaceholder when selectedTypes changes", async () => {
    const { result } = renderHook(() => useSearchPageData());

    expect(result.current.searchPlaceholder).toBe(
      "e.g. Chewbacca, Yoda, Boba Fett"
    );

    // Add Film
    act(() => {
      result.current.handleToggleType(SearchResultEntityType.Films);
    });

    await waitFor(() => {
      expect(result.current.selectedTypes).toContain(
        SearchResultEntityType.Films
      );
    });

    expect(result.current.searchPlaceholder).toBe(
      "e.g. Darth Vader, A New Hope, Luke Skywalker, Return of the Jedi"
    );

    // Remove Person, leaving only Film
    act(() => {
      result.current.handleToggleType(SearchResultEntityType.People);
    });

    await waitFor(() => {
      expect(result.current.selectedTypes).not.toContain(
        SearchResultEntityType.People
      );
    });

    expect(result.current.searchPlaceholder).toBe(
      "e.g. The Empire Strikes Back, The Force Awakens"
    );
  });

  it("should update states correctly on useCase success", async () => {
    const mockResults: SearchResultEntity[] = [
      {
        id: "1",
        name: "Luke Skywalker",
        entityType: SearchResultEntityType.People,
      },
      {
        id: "2",
        name: "A New Hope",
        entityType: SearchResultEntityType.Films,
      },
    ];

    mockExecute.mockResolvedValue(mockResults);

    const { result } = renderHook(() => useSearchPageData());

    act(() => {
      result.current.setSearchTerm("luke");
    });

    await act(async () => {
      await result.current.handleSearch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.results).toEqual(mockResults);
    expect(mockExecute).toHaveBeenCalledWith("luke", [
      SearchResultEntityType.People,
    ]);
  });

  it("should handle error correctly on useCase error", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockExecute.mockRejectedValue(new Error("Search failed"));

    const { result } = renderHook(() => useSearchPageData());

    act(() => {
      result.current.setSearchTerm("test");
    });

    await act(async () => {
      await result.current.handleSearch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.results).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Search failed:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it("should allow selecting one or both types but never 0", () => {
    const { result } = renderHook(() => useSearchPageData());

    // Initially has Person selected
    expect(result.current.selectedTypes).toEqual([
      SearchResultEntityType.People,
    ]);

    // Add Film
    act(() => {
      result.current.handleToggleType(SearchResultEntityType.Films);
    });

    expect(result.current.selectedTypes).toHaveLength(2);
    expect(result.current.selectedTypes).toContain(
      SearchResultEntityType.People
    );
    expect(result.current.selectedTypes).toContain(
      SearchResultEntityType.Films
    );

    // Remove Person
    act(() => {
      result.current.handleToggleType(SearchResultEntityType.People);
    });

    // Should still have Film, but not Person
    expect(result.current.selectedTypes).toHaveLength(1);
    expect(result.current.selectedTypes).toContain(
      SearchResultEntityType.Films
    );
    expect(result.current.selectedTypes).not.toContain(
      SearchResultEntityType.People
    );

    // Try to remove Film
    act(() => {
      result.current.handleToggleType(SearchResultEntityType.Films);
    });

    // Should still have Film (cannot have 0 selected)
    expect(result.current.selectedTypes).toHaveLength(1);
    expect(result.current.selectedTypes).toContain(
      SearchResultEntityType.Films
    );
  });

  it("should not search when searchTerm is empty", async () => {
    const { result } = renderHook(() => useSearchPageData());

    await act(async () => {
      await result.current.handleSearch();
    });

    expect(mockExecute).not.toHaveBeenCalled();
  });

  it("should handle Enter key press", async () => {
    const mockResults: SearchResultEntity[] = [];
    mockExecute.mockResolvedValue(mockResults);

    const { result } = renderHook(() => useSearchPageData());

    act(() => {
      result.current.setSearchTerm("test");
    });

    const mockEvent = {
      key: "Enter",
    } as React.KeyboardEvent<HTMLInputElement>;

    await act(async () => {
      result.current.handleKeyDown(mockEvent);
    });

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalled();
    });
  });
});

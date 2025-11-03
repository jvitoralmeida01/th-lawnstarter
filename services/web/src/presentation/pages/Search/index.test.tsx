import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import SearchPage from "./index";
import useSearchPageData from "./hooks/useSearchPageData";
import { SearchResultEntityType } from "../../../domain/entities/SearchResultEntity";
import type { SearchResultEntity } from "../../../domain/entities/SearchResultEntity";

vi.mock("./hooks/useSearchPageData");

const mockUseSearchPageData = vi.mocked(useSearchPageData);

describe("SearchPage", () => {
  const defaultMockData = {
    searchTerm: "",
    setSearchTerm: vi.fn(),
    searchPlaceholder: "e.g. Chewbacca, Yoda, Boba Fett",
    selectedTypes: [SearchResultEntityType.People],
    handleToggleType: vi.fn(),
    results: [],
    loading: false,
    handleSearch: vi.fn(),
    handleKeyDown: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchPageData.mockReturnValue(defaultMockData);
  });

  it("should render the input field, the search button and the results list", () => {
    render(
      <BrowserRouter>
        <SearchPage />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/e.g. Chewbacca/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
    expect(screen.getByText(/Results/i)).toBeInTheDocument();
  });

  it("should render empty results list with an image and the correct message initially", () => {
    mockUseSearchPageData.mockReturnValue({
      ...defaultMockData,
      results: [],
    });

    render(
      <BrowserRouter>
        <SearchPage />
      </BrowserRouter>
    );

    const image = screen.getByRole("img", { name: /empty search/i });
    expect(image).toBeInTheDocument();
    expect(screen.getByText(/There are zero matches/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Use the form to search for People and Movies/i)
    ).toBeInTheDocument();
  });

  it("should allow both People and Films checkboxes to be selected at the same time", async () => {
    const user = userEvent.setup();
    const mockHandleToggleType = vi.fn();

    mockUseSearchPageData.mockReturnValue({
      ...defaultMockData,
      selectedTypes: [
        SearchResultEntityType.People,
        SearchResultEntityType.Films,
      ],
      handleToggleType: mockHandleToggleType,
    });

    render(
      <BrowserRouter>
        <SearchPage />
      </BrowserRouter>
    );

    const peopleCheckbox = screen.getByRole("checkbox", { name: /people/i });
    const filmsCheckbox = screen.getByRole("checkbox", { name: /movies/i });

    expect(peopleCheckbox).toBeChecked();
    expect(filmsCheckbox).toBeChecked();

    await user.click(filmsCheckbox);
    expect(mockHandleToggleType).toHaveBeenCalledWith(
      SearchResultEntityType.Films
    );
  });

  it("should change the textfield placeholder depending on the checkbox selected", () => {
    // Test People only
    mockUseSearchPageData.mockReturnValue({
      ...defaultMockData,
      selectedTypes: [SearchResultEntityType.People],
      searchPlaceholder: "e.g. Chewbacca, Yoda, Boba Fett",
    });

    const { rerender } = render(
      <BrowserRouter>
        <SearchPage />
      </BrowserRouter>
    );

    expect(
      screen.getByPlaceholderText("e.g. Chewbacca, Yoda, Boba Fett")
    ).toBeInTheDocument();

    // Test Films only
    mockUseSearchPageData.mockReturnValue({
      ...defaultMockData,
      selectedTypes: [SearchResultEntityType.Films],
      searchPlaceholder: "e.g. The Empire Strikes Back, The Force Awakens",
    });

    rerender(
      <BrowserRouter>
        <SearchPage />
      </BrowserRouter>
    );

    expect(
      screen.getByPlaceholderText(
        "e.g. The Empire Strikes Back, The Force Awakens"
      )
    ).toBeInTheDocument();

    // Test both
    mockUseSearchPageData.mockReturnValue({
      ...defaultMockData,
      selectedTypes: [
        SearchResultEntityType.People,
        SearchResultEntityType.Films,
      ],
      searchPlaceholder:
        "e.g. Darth Vader, A New Hope, Luke Skywalker, Return of the Jedi",
    });

    rerender(
      <BrowserRouter>
        <SearchPage />
      </BrowserRouter>
    );

    expect(
      screen.getByPlaceholderText(
        "e.g. Darth Vader, A New Hope, Luke Skywalker, Return of the Jedi"
      )
    ).toBeInTheDocument();
  });

  it("should render Results list when results are received from the API", () => {
    const mockResults: SearchResultEntity[] = [
      {
        id: "1",
        name: "Luke Skywalker",
        type: SearchResultEntityType.People,
      },
      {
        id: "2",
        name: "A New Hope",
        type: SearchResultEntityType.Films,
      },
    ];

    mockUseSearchPageData.mockReturnValue({
      ...defaultMockData,
      results: mockResults,
    });

    render(
      <BrowserRouter>
        <SearchPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Luke Skywalker")).toBeInTheDocument();
    expect(screen.getByText("A New Hope")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /see details/i })
    ).toHaveLength(2);
    expect(
      screen.queryByRole("img", { name: /empty search/i })
    ).not.toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import FilmPage from "./index";
import useFilmPageData from "./hooks/useFilmPageData";
import type { FilmDetailsEntity } from "../../../domain/entities/FilmEntity";

// Mock the hook
vi.mock("./hooks/useFilmPageData");

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("FilmPage", () => {
  const mockFilm: FilmDetailsEntity = {
    id: "1",
    name: "A New Hope",
    openingCrawl:
      "It is a period of civil war.\n\nRebel spaceships, striking\nfrom a hidden base, have won\ntheir first victory against\nthe evil Galactic Empire.\n\nDuring the battle, Rebel\nspies managed to steal secret\nplans to the Empire's\nultimate weapon, the DEATH\nSTAR, an armored space\nstation with enough power\nto destroy an entire planet.\n\nPursued by the Empire's\nsinister agents, Princess\nLeia races home aboard her\nstarship, custodian of the\nstolen plans that can save her\npeople and restore\nfreedom to the galaxy....",
    characters: [
      { id: "1", name: "Luke Skywalker" },
      { id: "2", name: "Darth Vader" },
      { id: "3", name: "Princess Leia" },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the opening crawl, the characters list and the correct title", async () => {
    vi.mocked(useFilmPageData).mockReturnValue({
      filmId: "1",
      film: mockFilm,
      loading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <FilmPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("A New Hope")).toBeInTheDocument();
      expect(screen.getByText(/Opening Crawl/i)).toBeInTheDocument();
      expect(
        screen.getByText(/It is a period of civil war/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Characters/i)).toBeInTheDocument();
      expect(screen.getByText("Luke Skywalker")).toBeInTheDocument();
      expect(screen.getByText("Darth Vader")).toBeInTheDocument();
      expect(screen.getByText("Princess Leia")).toBeInTheDocument();
    });
  });

  it("should render the opening crawl in a scrollable container when overflowing", async () => {
    vi.mocked(useFilmPageData).mockReturnValue({
      filmId: "1",
      film: mockFilm,
      loading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <FilmPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const openingCrawlContainer = screen
        .getByText(/Opening Crawl/i)
        .closest("div")?.parentElement;
      const scrollableContainer =
        openingCrawlContainer?.closest(".overflow-y-scroll");
      expect(scrollableContainer).toBeInTheDocument();
    });
  });

  it("should navigate to the search page when BACK TO SEARCH button is clicked", async () => {
    vi.mocked(useFilmPageData).mockReturnValue({
      filmId: "1",
      film: mockFilm,
      loading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <FilmPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const backButton = screen.getByRole("button", {
        name: /back to search/i,
      });
      expect(backButton).toBeInTheDocument();
      backButton.click();
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("should navigate to the character page when character textlink is clicked", async () => {
    vi.mocked(useFilmPageData).mockReturnValue({
      filmId: "1",
      film: mockFilm,
      loading: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <FilmPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const lukeLink = screen.getByRole("link", { name: "Luke Skywalker" });
      expect(lukeLink).toBeInTheDocument();
      expect(lukeLink).toHaveAttribute("href", "/people/1");
    });
  });
});

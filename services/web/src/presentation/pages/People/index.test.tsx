import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import PeoplePage from "./index";
import usePeoplePageData from "./hooks/usePeoplePageData";
import type { PersonDetailsEntity } from "../../../domain/entities/PersonEntity";

// Mock the hook
vi.mock("./hooks/usePeoplePageData");

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("PeoplePage", () => {
  const mockPerson: PersonDetailsEntity = {
    id: "1",
    name: "Luke Skywalker",
    birthYear: "19BBY",
    gender: "male",
    eyeColor: "blue",
    hairColor: "blond",
    height: 172,
    mass: 77,
    films: [
      { id: "1", name: "A New Hope" },
      { id: "2", name: "The Empire Strikes Back" },
      { id: "3", name: "Return of the Jedi" },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the people details, the films list and the correct character name", async () => {
    vi.mocked(usePeoplePageData).mockReturnValue({
      personId: "1",
      person: mockPerson,
      loading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <PeoplePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Luke Skywalker")).toBeInTheDocument();
      expect(screen.getByText(/Details/i)).toBeInTheDocument();
      expect(screen.getByText(/Birth Year:/i)).toBeInTheDocument();
      expect(screen.getByText("19BBY")).toBeInTheDocument();
      expect(screen.getByText(/Gender:/i)).toBeInTheDocument();
      expect(screen.getByText("male")).toBeInTheDocument();
      expect(screen.getByText(/Eye Color:/i)).toBeInTheDocument();
      expect(screen.getByText("blue")).toBeInTheDocument();
      expect(screen.getByText(/Hair Color:/i)).toBeInTheDocument();
      expect(screen.getByText("blond")).toBeInTheDocument();
      expect(screen.getByText(/Height:/i)).toBeInTheDocument();
      expect(screen.getByText("172")).toBeInTheDocument();
      expect(screen.getByText(/Mass:/i)).toBeInTheDocument();
      expect(screen.getByText("77")).toBeInTheDocument();
      expect(screen.getByText(/Movies/i)).toBeInTheDocument();
      expect(screen.getByText("A New Hope")).toBeInTheDocument();
      expect(screen.getByText("The Empire Strikes Back")).toBeInTheDocument();
      expect(screen.getByText("Return of the Jedi")).toBeInTheDocument();
    });
  });

  it("should navigate to the search page when BACK TO SEARCH button is clicked", async () => {
    vi.mocked(usePeoplePageData).mockReturnValue({
      personId: "1",
      person: mockPerson,
      loading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <PeoplePage />
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

  it("should navigate to the film page when film textlink is clicked", async () => {
    vi.mocked(usePeoplePageData).mockReturnValue({
      personId: "1",
      person: mockPerson,
      loading: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <PeoplePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const filmLink = screen.getByRole("link", { name: "A New Hope" });
      expect(filmLink).toBeInTheDocument();
      expect(filmLink).toHaveAttribute("href", "/film/1");
    });
  });
});

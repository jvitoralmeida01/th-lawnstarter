import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatisticsPage from "./index";
import useStatisticsPageData from "./hooks/useStatisticsPageData";
import type {
  TopQueryEntity,
  AverageRequestTimeEntity,
  PopularTimeEntity,
} from "../../../domain/entities/StatisticsEntity";

vi.mock("./hooks/useStatisticsPageData");

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("StatisticsPage", () => {
  const mockTopQueries: TopQueryEntity[] = [
    { query: "Luke Skywalker", percentage: "45.5" },
    { query: "Darth Vader", percentage: "30.2" },
    { query: "A New Hope", percentage: "15.3" },
    { query: "The Empire Strikes Back", percentage: "6.0" },
    { query: "Return of the Jedi", percentage: "3.0" },
  ];

  const mockAverageRequestTime: AverageRequestTimeEntity = {
    averageTimeMs: "250 ms",
  };

  const mockPopularTime: PopularTimeEntity = {
    hour: "14:00",
    requestCount: "150",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the top queries, average request time, popular time and the correct title", async () => {
    vi.mocked(useStatisticsPageData).mockReturnValue({
      topQueries: mockTopQueries,
      averageRequestTime: mockAverageRequestTime,
      popularTime: mockPopularTime,
      loading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <StatisticsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Statistics")).toBeInTheDocument();
      expect(screen.getByText(/Top 5 queries/i)).toBeInTheDocument();
      expect(screen.getByText("Luke Skywalker")).toBeInTheDocument();
      expect(screen.getByText("Darth Vader")).toBeInTheDocument();
      expect(
        screen.getByText(/Average length of request timing/i)
      ).toBeInTheDocument();
      expect(screen.getByText("250 ms")).toBeInTheDocument();
      expect(
        screen.getByText(/Most popular hour of day for overall request volume/i)
      ).toBeInTheDocument();
      expect(screen.getByText("14:00")).toBeInTheDocument();
    });
  });
});

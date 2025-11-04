import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TopQueries from "./TopQueries";
import type { TopQueryEntity } from "../../../../domain/entities/StatisticsEntity";

describe("TopQueries", () => {
  const mockQueries: TopQueryEntity[] = [
    { query: "Luke Skywalker", percentage: "45.5" },
    { query: "Darth Vader", percentage: "30.2" },
    { query: "A New Hope", percentage: "15.3" },
    { query: "The Empire Strikes Back", percentage: "6" },
    { query: "Return of the Jedi", percentage: "3" },
  ];

  it("should render the correct number of queries", () => {
    render(<TopQueries queries={mockQueries} />);

    const queryElements = screen.getAllByText(
      /Luke Skywalker|Darth Vader|A New Hope|The Empire Strikes Back|Return of the Jedi/i
    );
    expect(queryElements).toHaveLength(mockQueries.length);
  });

  it("should render top1 in gold, top2 in silver, top3 in bronze and the rest in neutral", () => {
    const { container } = render(<TopQueries queries={mockQueries} />);

    const containerDiv = container.querySelector(".flex.flex-col");
    expect(containerDiv).toBeInTheDocument();

    const queryContainers = containerDiv?.children || [];
    expect(queryContainers).toHaveLength(mockQueries.length);

    // Top 1 (index 0) should have gold background
    const top1 = queryContainers[0] as HTMLElement;
    expect(top1).toHaveClass("bg-[var(--color-metallic-gold-bg)]");
    // Top 1 (index 0) should have gold gradient foreground (inner div)
    const top1Fg = top1.querySelector(".z-10.rounded-full") as HTMLElement;
    expect(top1Fg).toHaveClass("bg-gradient-to-b");
    expect(top1Fg.className).toContain(
      "from-[var(--color-metallic-gold-from)]"
    );
    expect(top1Fg.className).toContain("via-[var(--color-metallic-gold-via)]");
    expect(top1Fg.className).toContain("to-[var(--color-metallic-gold-to)]");

    // Top 2 (index 1) should have silver background
    const top2 = queryContainers[1] as HTMLElement;
    expect(top2).toHaveClass("bg-[var(--color-metallic-silver-bg)]");
    // Top 2 (index 1) should have silver gradient foreground (inner div)
    const top2Fg = top2.querySelector(".z-10.rounded-full") as HTMLElement;
    expect(top2Fg).toHaveClass("bg-gradient-to-b");
    expect(top2Fg.className).toContain(
      "from-[var(--color-metallic-silver-from)]"
    );
    expect(top2Fg.className).toContain(
      "via-[var(--color-metallic-silver-via)]"
    );
    expect(top2Fg.className).toContain("to-[var(--color-metallic-silver-to)]");

    // Top 3 (index 2) should have bronze background
    const top3 = queryContainers[2] as HTMLElement;
    expect(top3).toHaveClass("bg-[var(--color-metallic-bronze-bg)]");
    // Top 3 (index 2) should have bronze gradient foreground (inner div)
    const top3Fg = top3.querySelector(".z-10.rounded-full") as HTMLElement;
    expect(top3Fg).toHaveClass("bg-gradient-to-b");
    expect(top3Fg.className).toContain(
      "from-[var(--color-metallic-bronze-from)]"
    );
    expect(top3Fg.className).toContain(
      "via-[var(--color-metallic-bronze-via)]"
    );
    expect(top3Fg.className).toContain("to-[var(--color-metallic-bronze-to)]");

    // Rest (index 3+) should have transparent background (neutral)
    const rest = Array.from(queryContainers).slice(3) as HTMLElement[];
    rest.forEach((element) => {
      expect(element).toHaveClass("bg-transparent");
      // Rest (index 3+) should have flat colored foreground (inner div)
      const restFg = element.querySelector(".z-10.rounded-full") as HTMLElement;
      expect(restFg).toHaveClass("bg-neutral-400");
    });
  });

  it("should render the query text and percentage for each query", () => {
    const { container } = render(<TopQueries queries={mockQueries} />);

    expect(screen.getByText("Luke Skywalker")).toBeInTheDocument();
    expect(screen.getByText("Darth Vader")).toBeInTheDocument();
    expect(screen.getByText("A New Hope")).toBeInTheDocument();
    expect(screen.getByText("The Empire Strikes Back")).toBeInTheDocument();
    expect(screen.getByText("Return of the Jedi")).toBeInTheDocument();

    const percentageElements = container.querySelectorAll('p[class*="z-20"]');
    expect(percentageElements).toHaveLength(mockQueries.length);

    const percentages = Array.from(percentageElements).map((el) =>
      el.textContent?.trim()
    );
    expect(percentages).toContain("45.5%");
    expect(percentages).toContain("30.2%");
    expect(percentages).toContain("15.3%");
    expect(percentages).toContain("6%");
    expect(percentages).toContain("3%");
  });
});

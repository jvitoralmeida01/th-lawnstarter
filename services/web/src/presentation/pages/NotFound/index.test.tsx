import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFoundPage from "./index";

describe("NotFoundPage", () => {
  it("should render the empty search image and the text", () => {
    render(<NotFoundPage />);

    const image = screen.getByRole("img", { name: /empty search/i });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src");

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Nothing to see here...")).toBeInTheDocument();
  });
});

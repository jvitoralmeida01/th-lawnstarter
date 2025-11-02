import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { TextLink } from "./TextLink";

describe("TextLink", () => {
  it("should render a NavLink with the correct className", () => {
    render(
      <BrowserRouter>
        <TextLink to="/test">Test Link</TextLink>
      </BrowserRouter>
    );

    const link = screen.getByRole("link", { name: /test link/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveClass("group");
    expect(link).toHaveClass("transition");
    expect(link).toHaveClass("duration-300");
    expect(link).toHaveClass("text-accent");
    expect(link).toHaveClass("hover:text-accent-hover");
  });

  it("should navigate to the correct URL", () => {
    render(
      <BrowserRouter>
        <TextLink to="/test-path">Test Link</TextLink>
      </BrowserRouter>
    );

    const link = screen.getByRole("link", { name: /test link/i });
    expect(link).toHaveAttribute("href", "/test-path");
  });

  it("should apply transition effect on hover", () => {
    render(
      <BrowserRouter>
        <TextLink to="/test">Test Link</TextLink>
      </BrowserRouter>
    );

    const link = screen.getByRole("link", { name: /test link/i });
    expect(link).toHaveClass("group");

    const transitionSpan = link.querySelector("span");
    expect(transitionSpan).toBeInTheDocument();
    expect(transitionSpan).toHaveClass("block");
    expect(transitionSpan).toHaveClass("max-w-0");
    expect(transitionSpan).toHaveClass("group-hover:max-w-full");
    expect(transitionSpan).toHaveClass("transition-all");
    expect(transitionSpan).toHaveClass("duration-500");
  });

  it("should apply custom className when provided", () => {
    render(
      <BrowserRouter>
        <TextLink to="/test" className="custom-class">
          Test Link
        </TextLink>
      </BrowserRouter>
    );

    const link = screen.getByRole("link", { name: /test link/i });
    expect(link).toHaveClass("custom-class");
  });
});

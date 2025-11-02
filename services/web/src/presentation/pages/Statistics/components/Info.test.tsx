import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Info from "./Info";

describe("Info", () => {
  it("should render the badge with the default className when badgeClassName is not provided", () => {
    const { container } = render(<Info value="Test Value" />);

    const badge = container.querySelector(".w-1.h-8.rounded");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-neutral-400");
  });

  it("should render the badge with the custom className when badgeClassName is provided", () => {
    const customClassName = "bg-blue-500";
    const { container } = render(
      <Info value="Test Value" badgeClassName={customClassName} />
    );

    const badge = container.querySelector(".w-1.h-8.rounded");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(customClassName);
    expect(badge).not.toHaveClass("bg-neutral-400");
  });

  it("should render the value text", () => {
    const { getByText } = render(<Info value="250 ms" />);
    expect(getByText("250 ms")).toBeInTheDocument();
  });
});

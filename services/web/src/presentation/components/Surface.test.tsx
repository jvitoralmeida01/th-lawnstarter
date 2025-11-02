import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Surface from "./Surface";

describe("Surface", () => {
  it("should apply className prop to the surface", () => {
    const { container } = render(
      <Surface className="custom-class">Content</Surface>
    );

    const surface = container.firstChild as HTMLElement;
    expect(surface).toBeInTheDocument();
    expect(surface).toHaveClass("custom-class");
    expect(surface).toHaveClass("bg-neutral-100");
    expect(surface).toHaveClass("rounded-lg");
  });

  it("should render actionComponent when provided", () => {
    const actionComponent = <button data-testid="action-button">Action</button>;

    render(<Surface actionComponent={actionComponent}>Content</Surface>);

    expect(screen.getByTestId("action-button")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("should not render actionComponent when not provided", () => {
    render(<Surface>Content</Surface>);

    expect(screen.queryByTestId("action-button")).not.toBeInTheDocument();
  });
});

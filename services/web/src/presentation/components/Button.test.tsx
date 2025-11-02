import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Button from "./Button";

describe("Button", () => {
  const mockOnClick = vi.fn();
  const mockIcon = <span data-testid="icon">Icon</span>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render primary variant with primary color background and hover effect", () => {
    render(
      <Button variant="primary" onClick={mockOnClick}>
        Click me
      </Button>
    );

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-primary-500");
    expect(button).toHaveClass("hover:bg-primary-300");
  });

  it("should not render icon when primary variant has icon prop", () => {
    render(
      <Button variant="primary" onClick={mockOnClick} icon={mockIcon}>
        Click me
      </Button>
    );

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(screen.queryByTestId("icon")).not.toBeInTheDocument();
  });

  it("should render secondary variant with border and hover effect", () => {
    render(
      <Button variant="secondary" onClick={mockOnClick}>
        Click me
      </Button>
    );

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("border");
    expect(button).toHaveClass("border-primary-300");
    expect(button).toHaveClass("hover:bg-primary-300");
  });

  it("should render icon when secondary variant has icon prop", () => {
    render(
      <Button variant="secondary" onClick={mockOnClick} icon={mockIcon}>
        Click me
      </Button>
    );

    const icons = screen.getAllByTestId("icon");
    expect(icons.length).toBe(2);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("should render text without icon when secondary variant has no icon prop", () => {
    render(
      <Button variant="secondary" onClick={mockOnClick}>
        Click me
      </Button>
    );

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(screen.queryByTestId("icon")).not.toBeInTheDocument();
  });

  it("should have responsive classes to show icon only on small screens when secondary variant has icon", () => {
    render(
      <Button variant="secondary" onClick={mockOnClick} icon={mockIcon}>
        Click me
      </Button>
    );

    const buttons = screen.getAllByRole("button");
    const mobileButton = buttons.find((btn) =>
      btn.className.includes("flex md:hidden")
    );
    const desktopButton = buttons.find((btn) =>
      btn.className.includes("hidden md:flex")
    );

    expect(mobileButton).toBeInTheDocument();
    expect(desktopButton).toBeInTheDocument();

    // Mobile button should only contain icon, not text
    const mobileIcon = mobileButton?.querySelector('[data-testid="icon"]');
    expect(mobileIcon).toBeInTheDocument();
    expect(mobileButton).not.toHaveTextContent("Click me");

    // Desktop button should contain both icon and text
    const desktopIcon = desktopButton?.querySelector('[data-testid="icon"]');
    expect(desktopIcon).toBeInTheDocument();
    expect(desktopButton).toHaveTextContent("Click me");
  });
});

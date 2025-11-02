import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import Navbar from "./Navbar";

describe("Navbar", () => {
  const mockChangeTheme = vi.fn();
  const mockThemeIcon = <span data-testid="theme-icon">Theme Icon</span>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render clickable title, CHANGE THEME button, and STATISTICS button", () => {
    render(
      <BrowserRouter>
        <Navbar changeTheme={mockChangeTheme} themeIcon={mockThemeIcon} />
      </BrowserRouter>
    );

    expect(screen.getByText("SWStarter")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /change theme/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /statistics/i })
    ).toBeInTheDocument();
  });

  it("should call changeTheme when CHANGE THEME button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Navbar changeTheme={mockChangeTheme} themeIcon={mockThemeIcon} />
      </BrowserRouter>
    );

    const changeThemeButton = screen.getByRole("button", {
      name: /change theme/i,
    });
    await user.click(changeThemeButton);

    expect(mockChangeTheme).toHaveBeenCalledTimes(1);
  });

  it("should navigate to statistics page when STATISTICS button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Navbar changeTheme={mockChangeTheme} themeIcon={mockThemeIcon} />
      </BrowserRouter>
    );

    const statisticsButton = screen.getByRole("button", {
      name: /statistics/i,
    });
    await user.click(statisticsButton);

    expect(window.location.pathname).toBe("/statistics");
  });

  it("should navigate to home page when SWStarter title is clicked", async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Navbar changeTheme={mockChangeTheme} themeIcon={mockThemeIcon} />
      </BrowserRouter>
    );

    const title = screen.getByText("SWStarter");
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass("hover:cursor-pointer");

    await user.click(title);

    expect(window.location.pathname).toBe("/");
  });
});

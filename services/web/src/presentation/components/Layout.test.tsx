import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Layout from "./Layout";
import userEvent from "@testing-library/user-event";

vi.mock("../assets/LawnStarterIcon.svg?react", () => ({
  default: () => <svg data-testid="lawnstarter-icon">LawnStarter</svg>,
}));

vi.mock("../assets/StarWarsIcon.svg?react", () => ({
  default: () => <svg data-testid="starwars-icon">StarWars</svg>,
}));

describe("Layout", () => {
  it("should render Navbar and Outlet components", () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );

    expect(screen.getByText("SWStarter")).toBeInTheDocument();
    expect(screen.getByText("STATISTICS")).toBeInTheDocument();
    expect(screen.getByText("CHANGE THEME")).toBeInTheDocument();

    // Ensure the main element is rendered inside the Outlet component
    expect(document.querySelector("main")).toBeInTheDocument();
  });

  it("should change theme and font classes and theme icon when changeTheme is called", async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );

    const layoutDiv = document.querySelector("div.mx-auto.min-h-screen");
    expect(layoutDiv).toBeInTheDocument();

    // Initially should have no theme class (empty string from themes array) and show LawnStarter icon
    expect(layoutDiv).not.toHaveClass("theme-starwars");
    expect(layoutDiv).not.toHaveClass("font-orbitron");
    const lawnStarterIcons = screen.getAllByTestId("lawnstarter-icon");
    expect(lawnStarterIcons.length).toBeGreaterThan(0);

    const changeThemeButton = screen.getByRole("button", {
      name: /change theme/i,
    });
    await user.click(changeThemeButton);

    // After clicking, should have StarWars theme
    expect(layoutDiv).toHaveClass("theme-starwars");
    expect(layoutDiv).toHaveClass("font-orbitron");
    const starWarsIcons = screen.getAllByTestId("starwars-icon");
    expect(starWarsIcons.length).toBeGreaterThan(0);

    await user.click(changeThemeButton);

    // Should be back to default (no theme classes)
    expect(layoutDiv).not.toHaveClass("theme-starwars");
    expect(layoutDiv).not.toHaveClass("font-orbitron");
    const lawnStarterIconsAfterToggle =
      screen.getAllByTestId("lawnstarter-icon");
    expect(lawnStarterIconsAfterToggle.length).toBeGreaterThan(0);
  });
});

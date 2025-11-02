import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import LawnStarterIcon from "../assets/LawnStarterIcon.svg?react";
import StarWarsIcon from "../assets/StarWarsIcon.svg?react";

const themes: string[] = ["theme-starwars", ""];
const fonts: string[] = ["font-orbitron", "font-montserrat"];
const icons = [
  <StarWarsIcon key="starwars" className="w-m h-m" />,
  <LawnStarterIcon key="lawnstarter" className="w-m h-m" />,
];

function Layout() {
  const [themeClassName, setThemeClassName] = useState<string>("");
  const [fontClassName, setFontClassName] = useState<string>("");
  const [themeIcon, setThemeIcon] = useState<React.ReactNode>(icons[1]);

  const changeTheme = () => {
    const currentIndex = themes.indexOf(themeClassName);
    const nextIndex = (currentIndex + 1) % themes.length;
    setThemeClassName(themes[nextIndex]);
    setFontClassName(fonts[nextIndex]);
    setThemeIcon(icons[nextIndex]);
  };

  return (
    <div
      className={`${themeClassName} ${fontClassName} mx-auto min-h-screen bg-neutral-100 md:bg-background selection:bg-selection`}
    >
      <Navbar changeTheme={changeTheme} themeIcon={themeIcon} />
      <main className="mx-auto mt-l">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;

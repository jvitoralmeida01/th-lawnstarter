import { useNavigate } from "react-router-dom";
import Button from "./Button";

interface NavbarProps {
  changeTheme: () => void;
  themeIcon: React.ReactNode;
}

function Navbar({ changeTheme, themeIcon }: NavbarProps) {
  const navigate = useNavigate();

  return (
    <nav className="py-2 grid grid-cols-3 w-full items-center px-4 shadow shadow-shadow-75 bg-neutral-100">
      <div className="flex" />
      <h1
        onClick={() => navigate("/")}
        className="text-primary-300 font-bold text-center hover:cursor-pointer"
      >
        SWStarter
      </h1>
      <div className="flex justify-end gap-xs">
        <Button onClick={() => navigate("/statistics")} variant="secondary">
          STATISTICS
        </Button>
        <Button onClick={changeTheme} variant="secondary" icon={themeIcon}>
          CHANGE THEME
        </Button>
      </div>
    </nav>
  );
}

export default Navbar;

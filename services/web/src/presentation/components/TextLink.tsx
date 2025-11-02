import { NavLink } from "react-router-dom";

export const TextLink = ({
  to,
  children,
  className = "",
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <NavLink
      to={to}
      className={`group transition duration-300 text-accent hover:text-accent-hover ${className}`}
    >
      {children}
      <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-accent-hover"></span>
    </NavLink>
  );
};

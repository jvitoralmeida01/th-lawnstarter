interface ButtonProps {
  variant: "primary" | "secondary";
  disabled?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function Button({
  variant = "primary",
  disabled = false,
  onClick,
  icon,
  children,
}: ButtonProps) {
  if (variant === "secondary" && icon) {
    return (
      <>
        <button
          onClick={onClick}
          className="hidden md:flex items-center gap-xs py-xs px-s rounded-full text-action text-primary-500 bg-neutral-100 border border-primary-300 hover:text-neutral-100 hover:bg-primary-300 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={disabled}
        >
          {icon}
          {children}
        </button>
        <button
          onClick={onClick}
          className="flex md:hidden items-center gap-xs py-xs px-xs rounded-full text-action text-primary-500 bg-neutral-100 border border-primary-300 hover:text-neutral-100 hover:bg-primary-300 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={disabled}
        >
          {icon}
        </button>
      </>
    );
  }

  if (variant === "secondary" && !icon) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-xs py-xs px-s rounded-full text-action text-primary-500 bg-neutral-100 border border-primary-300 hover:text-neutral-100 hover:bg-primary-300 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {children}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex justify-center items-center gap-xs py-xs px-l  rounded-full text-content font-bold text-typography-100 bg-primary-500 hover:bg-primary-300 hover:cursor-pointer disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors"
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;

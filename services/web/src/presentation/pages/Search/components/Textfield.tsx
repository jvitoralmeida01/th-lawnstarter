interface TextfieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

function Textfield({
  value,
  onChange,
  placeholder,
  onKeyDown,
}: TextfieldProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className="w-full px-s py-xs border border-neutral-300 rounded-lg text-content text-typography-400 bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
    />
  );
}

export default Textfield;

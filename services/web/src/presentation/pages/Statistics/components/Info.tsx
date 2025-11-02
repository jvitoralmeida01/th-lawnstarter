interface InfoProps {
  value: string;
  badgeClassName?: string;
}

function Info({ value, badgeClassName = "bg-neutral-400" }: InfoProps) {
  return (
    <div className="flex items-center gap-s">
      <div className={`w-1 h-8 rounded ${badgeClassName}`} />
      <span className="text-title text-typography-400 font-bold">{value}</span>
    </div>
  );
}

export default Info;

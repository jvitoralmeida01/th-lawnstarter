import { CiWarning } from "react-icons/ci";

interface InfoProps {
  value?: string;
  badgeClassName?: string;
  detail?: string;
  noData?: boolean;
}

function Info({
  value,
  badgeClassName = "bg-neutral-400",
  detail,
  noData = false,
}: InfoProps) {
  if (noData) {
    return (
      <div className="flex items-center gap-xs">
        <CiWarning className="text-warn" />
        <div className="text-content text-neutral-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-s">
      <div className={`w-1 h-8 rounded ${badgeClassName}`} />
      <span className="text-title text-typography-400 font-bold">{value}</span>
      {detail && (
        <span className="text-subtitle text-neutral-500 py-xxs px-xs bg-neutral-200 rounded-full">
          {detail}
        </span>
      )}
    </div>
  );
}

export default Info;

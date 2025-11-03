import type { TopQueryEntity } from "../../../../domain/entities/StatisticsEntity";

interface TopQueriesProps {
  queries: TopQueryEntity[];
}

function TopQueries({ queries }: TopQueriesProps) {
  return (
    <div className="group flex flex-col gap-xs">
      {queries.map((query, index) => {
        const barWidth = `${query.percentage}%`;

        let bgClassName = "bg-transparent";
        let fgClassName = "bg-neutral-400";

        if (index === 0) {
          // Gold metallic gradient
          bgClassName = "bg-[var(--color-metallic-gold-bg)]";
          fgClassName =
            "bg-gradient-to-b from-[var(--color-metallic-gold-from)] via-[var(--color-metallic-gold-via)] to-[var(--color-metallic-gold-to)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),inset_0_-1px_2px_rgba(0,0,0,0.2)]";
        } else if (index === 1) {
          // Silver metallic gradient
          bgClassName = "bg-[var(--color-metallic-silver-bg)]";
          fgClassName =
            "bg-gradient-to-b from-[var(--color-metallic-silver-from)] via-[var(--color-metallic-silver-via)] to-[var(--color-metallic-silver-to)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(0,0,0,0.3)]";
        } else if (index === 2) {
          // Bronze metallic gradient
          bgClassName = "bg-[var(--color-metallic-bronze-bg)]";
          fgClassName =
            "bg-gradient-to-b from-[var(--color-metallic-bronze-from)] via-[var(--color-metallic-bronze-via)] to-[var(--color-metallic-bronze-to)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),inset_0_-1px_2px_rgba(0,0,0,0.3)]";
        }

        return (
          <div
            key={query.query}
            className={`${bgClassName} group-hover:opacity-50 transition-opacity hover:opacity-100 relative w-full h-8 rounded-full flex items-center overflow-hidden border border-neutral-300`}
          >
            <div
              className={`${fgClassName} z-10 rounded-full absolute inset-y-0 left-0`}
              style={{
                width: barWidth,
              }}
            />
            <span className="z-20 text-content text-neutral-500 p-1 bg-neutral-100 opacity-50 rounded-full absolute left-1">
              {query.query}
            </span>
            <p className="z-20 text-content text-neutral-500 p-1 bg-neutral-100 opacity-50 rounded-full absolute right-1">
              {query.percentage}%
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default TopQueries;

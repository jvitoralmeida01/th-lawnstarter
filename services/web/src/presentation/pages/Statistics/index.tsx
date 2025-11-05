import { useNavigate } from "react-router-dom";
import Surface from "../../components/Surface.tsx";
import Button from "../../components/Button.tsx";
import TopQueries from "./components/TopQueries.tsx";
import Info from "./components/Info.tsx";
import EmptySearchImage from "../../assets/EmptySearch.png";
import useStatisticsPageData from "./hooks/useStatisticsPageData.tsx";
import { GrTrophy } from "react-icons/gr";
import { FaRegClock } from "react-icons/fa";
import { IoMdStopwatch } from "react-icons/io";

function StatisticsPage() {
  const data = useStatisticsPageData();
  const navigate = useNavigate();

  if (data.loading) {
    return (
      <Surface className="container max-w-4xl h-xl md:h-lg mx-auto flex flex-col relative">
        <div className="flex flex-col gap-m items-center justify-center min-h-full">
          <div className="text-subtitle text-typography-300 animate-pulse">
            Loading statistics...
          </div>
        </div>
      </Surface>
    );
  }

  if (data.error) {
    return (
      <Surface className="container max-w-4xl h-xl md:h-lg mx-auto flex flex-col relative">
        <div className="flex flex-col gap-m items-center justify-center min-h-full">
          <img
            src={EmptySearchImage}
            alt="Empty search"
            draggable="false"
            className="w-60 h-60 object-contain"
          />
          <div className="flex flex-col gap-xxs items-center text-subtitle text-neutral-400 font-bold whitespace-pre-line">
            {data.error}
          </div>
        </div>
      </Surface>
    );
  }

  return (
    <Surface
      className="container max-w-4xl max-h-xl md:max-h-lg mx-auto flex flex-col relative"
      actionComponent={
        <Button onClick={() => navigate("/")} variant="primary">
          BACK TO SEARCH
        </Button>
      }
    >
      <div className="p-l md:overflow-y-auto overflow-scroll no-scrollbar flex-1 pb-20">
        <h1 className="text-title text-typography-400 font-bold mb-l bg-neutral-900">
          Statistics
        </h1>

        <div className="mb-l">
          <div className="flex items-center w-full gap-xs mb-xs pb-s border-b border-neutral-300">
            <GrTrophy className="text-neutral-500" />
            <h2 className="text-subtitle text-typography-400 font-bold">
              Top 5 queries
            </h2>
          </div>
          <TopQueries queries={data.topQueries?.slice(0, 5) ?? []} />
        </div>

        <div className="mb-l">
          <div className="flex items-center w-full gap-xs mb-xs pb-s border-b border-neutral-300">
            <IoMdStopwatch className="text-neutral-500" />
            <h2 className="text-subtitle text-typography-400 font-bold">
              Average length of request timing
            </h2>
          </div>
          <Info
            value={data.averageRequestTime?.averageTimeMs}
            noData={data.averageRequestTime?.averageTimeMs == "≈ 0 ms"}
            badgeClassName="bg-neutral-400"
          />
        </div>

        <div className="mb-l">
          <div className="flex items-center w-full gap-xs mb-xs pb-s border-b border-neutral-300">
            <FaRegClock className="text-neutral-500" />
            <h2 className="text-subtitle text-typography-400 font-bold">
              Most popular hour of day for overall request volume
            </h2>
          </div>
          <div className="flex flex-col gap-xs">
            <Info
              value={data.popularTime?.hour}
              noData={data.popularTime?.requestCount == "0"}
              detail={`${data.popularTime?.requestCount} requests`}
              badgeClassName="bg-neutral-400"
            />
          </div>
        </div>
      </div>
    </Surface>
  );
}

export default StatisticsPage;

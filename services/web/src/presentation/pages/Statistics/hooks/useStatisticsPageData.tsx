import { useState, useEffect } from "react";
import type {
  TopQueryEntity,
  AverageRequestTimeEntity,
  PopularTimeEntity,
} from "../../../../domain/entities/StatisticsEntity";
import { useGetStatisticsUseCase } from "../../../../infrastructure/di";

export interface StatisticsPageData {
  topQueries: TopQueryEntity[];
  averageRequestTime: AverageRequestTimeEntity | null;
  popularTime: PopularTimeEntity | null;
  loading: boolean;
  error: string | null;
}

function useStatisticsPageData(): StatisticsPageData {
  const [topQueries, setTopQueries] = useState<TopQueryEntity[]>([]);
  const [averageRequestTime, setAverageRequestTime] =
    useState<AverageRequestTimeEntity | null>(null);
  const [popularTime, setPopularTime] = useState<PopularTimeEntity | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getStatisticsUseCase = useGetStatisticsUseCase();

  useEffect(() => {
    async function loadStatistics() {
      try {
        setLoading(true);
        setError(null);

        const statistics = await getStatisticsUseCase.execute();

        setTopQueries(statistics.topQueries);
        setAverageRequestTime(statistics.averageRequestTime);
        setPopularTime(statistics.popularTime);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load statistics"
        );
      } finally {
        setLoading(false);
      }
    }

    loadStatistics();
  }, []);

  return {
    topQueries,
    averageRequestTime,
    popularTime,
    loading,
    error,
  };
}

export default useStatisticsPageData;

export interface TopQueryEntity {
  query: string;
  percentage: string;
}

export interface AverageRequestTimeEntity {
  averageTimeMs: string;
}

export interface PopularTimeEntity {
  hour: string;
  requestCount: string;
}

export interface StatisticsEntity {
  topQueries: TopQueryEntity[];
  averageRequestTime: AverageRequestTimeEntity;
  popularTime: PopularTimeEntity;
}

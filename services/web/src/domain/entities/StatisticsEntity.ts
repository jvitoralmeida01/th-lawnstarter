export interface TopQueryEntity {
  query: string;
  percentage: number;
}

export interface AverageRequestTimeEntity {
  averageTimeMs: number;
}

export interface PopularTimeEntity {
  hour: string;
  requestCount: number;
}

export interface StatisticsEntity {
  topQueries: TopQueryEntity[];
  averageRequestTime: AverageRequestTimeEntity;
  popularTime: PopularTimeEntity;
}

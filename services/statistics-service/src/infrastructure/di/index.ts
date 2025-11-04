import { container } from "./container.js";

export { container };

export function useGetTopQueriesUseCase() {
  return container.getGetTopQueriesUseCase();
}

export function useGetAverageRequestTimeUseCase() {
  return container.getGetAverageRequestTimeUseCase();
}

export function useGetPopularTimeUseCase() {
  return container.getGetPopularTimeUseCase();
}

export function useStatsSnapshotRepository() {
  return container.getStatsSnapshotRepository();
}

export function useEventStorageRepository() {
  return container.getEventStorageRepository();
}

export function useEventBrokerRepository() {
  return container.getEventBrokerRepository();
}

export function useConsumeEventsUseCase() {
  return container.getConsumeEventsUseCase();
}

export function useUpdateStatistics() {
  return container.getUpdateStatistics();
}

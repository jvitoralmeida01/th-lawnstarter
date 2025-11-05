import { container } from "./container.js";

export { container };

export function useGetFilmUseCase() {
  return container.getGetFilmUseCase();
}

export function useGetPersonUseCase() {
  return container.getGetPersonUseCase();
}

export function useSearchUseCase() {
  return container.getSearchUseCase();
}

export function useEventPublisher() {
  return container.getEventPublisher();
}

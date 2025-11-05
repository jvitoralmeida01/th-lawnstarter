import type { Request, Response } from "express";
import {
  useGetPersonUseCase,
  useEventPublisher,
} from "../../infrastructure/di/index.js";
import { PersonMapper } from "../mappers/PersonMapper.js";

export class PeopleController {
  async handle(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const { id } = req.params;
    const eventPublisher = useEventPublisher();

    try {
      if (!id) {
        res.status(400).json({
          message: "Person ID is required",
        });
        return;
      }

      const useCase = useGetPersonUseCase();
      const person = await useCase.execute(id);
      const response = PersonMapper.toResponse(person);

      const elapsedMs = Date.now() - startTime;
      const path = req.originalUrl; // Full path including query params
      const route = req.path; // Path without query params

      // Publish event
      await eventPublisher.publish({
        path,
        route,
        ms: elapsedMs,
        source: "starwars",
        occurred_at: new Date().toISOString(),
      });

      res.json(response);
    } catch (error: any) {
      console.error("Error fetching person:", error);

      const elapsedMs = Date.now() - startTime;
      const path = req.originalUrl; // Full path including query params
      const route = req.path; // Path without query params

      // Publish event even on error
      try {
        await eventPublisher.publish({
          path,
          route,
          ms: elapsedMs,
          source: "starwars",
          occurred_at: new Date().toISOString(),
        });
      } catch (publishError) {
        console.error("Error publishing event:", publishError);
      }

      if (error.response?.status === 404) {
        res.status(404).json({
          message: "Person not found",
        });
      } else {
        res.status(500).json({
          message: "Error fetching person",
        });
      }
    }
  }
}

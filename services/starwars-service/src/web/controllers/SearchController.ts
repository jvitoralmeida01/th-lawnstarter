import type { Request, Response } from "express";
import {
  useSearchUseCase,
  useEventPublisher,
} from "../../infrastructure/di/index.js";
import { SearchMapper } from "../mappers/SearchMapper.js";

export class SearchController {
  async handle(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const query = req.query.query as string;
    const entityTypesParam = req.query.entityTypes as string | string[];
    const eventPublisher = useEventPublisher();

    try {
      if (!query) {
        res.status(400).json({
          message: "Query is required",
        });
        return;
      }

      if (!entityTypesParam) {
        res.status(400).json({
          message: "Entity types are required",
        });
        return;
      }

      // Parse entityTypes - can be comma-separated string or array
      const entityTypes = Array.isArray(entityTypesParam)
        ? entityTypesParam
        : entityTypesParam.split(",").map((s) => s.trim());

      // Validate entity types
      const validTypes = entityTypes.filter(
        (type): type is "people" | "films" =>
          type === "people" || type === "films"
      );

      if (validTypes.length === 0) {
        res.status(400).json({
          message:
            "At least one valid entity type (people or films) is required",
        });
        return;
      }

      const useCase = useSearchUseCase();
      const results = await useCase.execute(query, validTypes);
      const response = SearchMapper.toResponse(results);

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
      console.error("Error searching:", error);

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

      res.status(500).json({
        message: "Error performing search",
      });
    }
  }
}

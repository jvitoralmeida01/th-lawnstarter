import type { Request, Response } from "express";
import { useGetTopQueriesUseCase } from "../../infrastructure/di/index.js";
import { TopQueriesMapper } from "../mappers/TopQueriesMapper.js";
import { calculateCacheHeaders } from "../utils/cacheHeaders.js";

export class TopQueriesController {
  async handle(req: Request, res: Response): Promise<void> {
    try {
      const useCase = useGetTopQueriesUseCase();
      const result = await useCase.execute();
      const response = TopQueriesMapper.toResponse(result.queries);

      const cacheControl = calculateCacheHeaders(result.computedAt);
      res.setHeader("Cache-Control", cacheControl);

      res.json(response);
    } catch (error) {
      console.error("Error fetching top queries:", error);
      res.status(500).json({
        message: "Error fetching top queries",
        result: [],
      });
    }
  }
}

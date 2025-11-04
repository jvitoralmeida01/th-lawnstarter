import type { Request, Response } from "express";
import { useGetPopularTimeUseCase } from "../../infrastructure/di/index.js";
import { PopularTimeMapper } from "../mappers/PopularTimeMapper.js";
import { calculateCacheHeaders } from "../utils/cacheHeaders.js";

export class PopularTimeController {
  async handle(req: Request, res: Response): Promise<void> {
    try {
      const useCase = useGetPopularTimeUseCase();
      const popularTime = await useCase.execute();
      const response = PopularTimeMapper.toResponse(popularTime);

      const cacheControl = calculateCacheHeaders(popularTime.computedAt);
      res.setHeader("Cache-Control", cacheControl);

      res.json(response);
    } catch (error) {
      console.error("Error fetching popular time:", error);
      res.status(500).json({
        message: "Error fetching popular time",
        result: {
          hour: "0",
          requestCount: 0,
        },
      });
    }
  }
}

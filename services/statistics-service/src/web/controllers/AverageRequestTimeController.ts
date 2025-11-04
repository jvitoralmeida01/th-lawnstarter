import type { Request, Response } from "express";
import { useGetAverageRequestTimeUseCase } from "../../infrastructure/di/index.js";
import { AverageRequestTimeMapper } from "../mappers/AverageRequestTimeMapper.js";
import { calculateCacheHeaders } from "../utils/cacheHeaders.js";

export class AverageRequestTimeController {
  async handle(req: Request, res: Response): Promise<void> {
    try {
      const useCase = useGetAverageRequestTimeUseCase();
      const averageRequestTime = await useCase.execute();
      const response = AverageRequestTimeMapper.toResponse(averageRequestTime);

      const cacheControl = calculateCacheHeaders(averageRequestTime.computedAt);
      res.setHeader("Cache-Control", cacheControl);

      res.json(response);
    } catch (error) {
      console.error("Error fetching average request time:", error);
      res.status(500).json({
        message: "Error fetching average request time",
        result: {
          averageTimeMs: 0,
        },
      });
    }
  }
}

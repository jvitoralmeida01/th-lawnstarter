import express from "express";
import { database } from "./database.js";
import type { TopQuery, AverageRequestTime, PopularTime } from "./types.js";

export function createApiRouter(): express.Router {
  const router = express.Router();

  router.use(express.json());

  router.get("/top-queries", async (req, res) => {
    try {
      const snapshot = await database.getLatestSnapshot();

      if (!snapshot) {
        return res.json({
          message: "No statistics available yet",
          result: [],
        });
      }

      const topQueries: TopQuery[] = snapshot.top_queries.map((q) => ({
        query: q.route,
        percentage: q.pct,
      }));

      res.json({
        message: "Top queries retrieved successfully",
        result: topQueries,
      });
    } catch (error) {
      console.error("Error fetching top queries:", error);
      res.status(500).json({
        message: "Error fetching top queries",
        result: [],
      });
    }
  });

  router.get("/average-request-time", async (req, res) => {
    try {
      const snapshot = await database.getLatestSnapshot();

      if (!snapshot) {
        return res.json({
          message: "No statistics available yet",
          result: {
            averageTimeMs: 0,
          },
        });
      }

      const averageRequestTime: AverageRequestTime = {
        averageTimeMs: snapshot.avg_ms,
      };

      res.json({
        message: "Average request time retrieved successfully",
        result: averageRequestTime,
      });
    } catch (error) {
      console.error("Error fetching average request time:", error);
      res.status(500).json({
        message: "Error fetching average request time",
        result: {
          averageTimeMs: 0,
        },
      });
    }
  });

  router.get("/popular-time", async (req, res) => {
    try {
      const snapshot = await database.getLatestSnapshot();

      if (!snapshot) {
        return res.json({
          message: "No statistics available yet",
          result: {
            hour: "0",
            requestCount: 0,
          },
        });
      }

      // Get request count for the popular hour from the snapshot
      const requestCount = await database.getRequestCountForHour(
        snapshot.popular_hour,
        snapshot.window_start,
        snapshot.window_end
      );

      const popularTime: PopularTime = {
        hour: snapshot.popular_hour.toString().padStart(2, "0"),
        requestCount,
      };

      res.json({
        message: "Popular time retrieved successfully",
        result: popularTime,
      });
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
  });

  router.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  return router;
}

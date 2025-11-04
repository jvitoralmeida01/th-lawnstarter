import express from "express";
import { TopQueriesController } from "../controllers/TopQueriesController.js";
import { AverageRequestTimeController } from "../controllers/AverageRequestTimeController.js";
import { PopularTimeController } from "../controllers/PopularTimeController.js";

export function createApiRouter(): express.Router {
  const router = express.Router();
  const topQueriesController = new TopQueriesController();
  const averageRequestTimeController = new AverageRequestTimeController();
  const popularTimeController = new PopularTimeController();

  router.use(express.json());

  router.get("/top-queries", (req, res) =>
    topQueriesController.handle(req, res)
  );
  router.get("/average-request-time", (req, res) =>
    averageRequestTimeController.handle(req, res)
  );
  router.get("/popular-time", (req, res) =>
    popularTimeController.handle(req, res)
  );

  router.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  return router;
}

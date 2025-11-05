import express from "express";
import { FilmsController } from "../controllers/FilmsController.js";
import { PeopleController } from "../controllers/PeopleController.js";
import { SearchController } from "../controllers/SearchController.js";

export function createApiRouter(): express.Router {
  const router = express.Router();
  const filmsController = new FilmsController();
  const peopleController = new PeopleController();
  const searchController = new SearchController();

  router.use(express.json());

  router.get("/films/:id", (req, res) => filmsController.handle(req, res));
  router.get("/people/:id", (req, res) => peopleController.handle(req, res));
  router.get("/search", (req, res) => searchController.handle(req, res));

  router.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  return router;
}

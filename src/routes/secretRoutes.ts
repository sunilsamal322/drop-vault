import { Router } from "express";
import SecretController from "../controllers/SecretController.js";

export default function secretRoutes(controller: SecretController): Router {
  const router = Router();

  router.post("/", controller.create);

  router.get("/:id", controller.getById);

  router.delete("/:id", controller.deleteById);

  return router;
}

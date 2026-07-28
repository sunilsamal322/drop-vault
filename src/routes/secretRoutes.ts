import { Router } from "express";
import SecretController from "../controllers/SecretController.js";
import upload from "../middlewares/upload.js";

export default function secretRoutes(controller: SecretController): Router {
  const router = Router();

  router.post("/text", controller.createTextSecret);

  router.post("/file", upload.single("file"), controller.createFileSecret);

  router.post("/:id", controller.getById);

  router.delete("/:id", controller.deleteById);

  return router;
}

import { Pool } from "pg";
import { Request, Response } from "express";

export default class HealthController {
  constructor(private readonly postgres: Pool) {}

  public check = async (_: Request, res: Response): Promise<void> => {
    try {
      await this.postgres.query("SELECT 1");

      res.json({
        status: "ok",
        database: "connected",
        uptimeSeconds: Math.floor(process.uptime()),
      });
    } catch {
      res.status(503).json({
        status: "error",
        database: "disconnected",
      });
    }
  }
}

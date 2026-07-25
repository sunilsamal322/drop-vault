import { Request, Response } from "express";
import SecretService from "../services/SecretService.js";
import { createSecretSchema } from "../validators/CreateSecretValidator.js";
import { paramsSchema, querySchema } from "../validators/GetSecretValidator.js";

export default class SecretController {
  constructor(private secretService: SecretService) {}

  public create = async (req: Request, res: Response): Promise<void> => {
    const payload = createSecretSchema.parse(req.body);
    const secret = await this.secretService.save(payload);
    res.status(201).json(secret);
  };

  public getById = async (req: Request, res: Response): Promise<void> => {
    const { id } = paramsSchema.parse(req.params);
    const { password } = querySchema.parse(req.body);
    const secret = await this.secretService.getById(id, password);

    res.json(secret);
  };

  public deleteById = async (req: Request, res: Response): Promise<void> => {
    const { id } = paramsSchema.parse(req.params);
    const { password } = querySchema.parse(req.body);
    await this.secretService.deleteById(id, password);

    res.sendStatus(204);
  };
}

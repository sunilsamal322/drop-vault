import { Request, Response } from "express";
import BadRequestError from "../errors/BadRequestError.js";
import { Readable } from "node:stream";
import SecretService from "../services/SecretService.js";
import { createSecretSchema } from "../validators/CreateSecretValidator.js";
import { createFileSecretSchema } from "../validators/CreateFileSecretValidator.js";
import { paramsSchema, querySchema } from "../validators/GetSecretValidator.js";

export default class SecretController {
  constructor(private secretService: SecretService) {}

  public createTextSecret = async (req: Request, res: Response): Promise<void> => {
    const payload = createSecretSchema.parse(req.body);
    const secret = await this.secretService.createTextSecret(payload);
    res.status(201).json(secret);
  };

  public createFileSecret = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw new BadRequestError("No file uploaded");
    }

    const stream = Readable.from(req.file.buffer);
    const payload = createFileSecretSchema.parse(req.body);

    const secret = await this.secretService.createFileSecret({
      ...payload,
      fileName: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size,
      stream,
    });

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

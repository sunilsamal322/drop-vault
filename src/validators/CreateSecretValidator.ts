import { z } from "zod";
import { SecretTypeEnum } from "../enums/SecretType.js";

export const createSecretSchema = z.object({
  type: z.enum(Object.values(SecretTypeEnum)),
  content: z.string().min(1).max(10000),
  password: z.string().min(4).optional(),
  maxViews: z.number().positive().optional(),
  expiresAt: z.date().optional(),
});

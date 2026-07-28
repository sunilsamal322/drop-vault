import { z } from "zod";

export const createFileSecretSchema = z.object({
  password: z
    .string()
    .min(4, "Password must be at least 4 characters long")
    .optional(),
  expiresAt: z.coerce.date().optional(),
  maxViews: z.number().positive().optional(),
});

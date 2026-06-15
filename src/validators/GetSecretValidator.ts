import { z } from "zod";

export const paramsSchema = z.object({
  id: z.uuid(),
});

export const querySchema = z.object({
  password: z.string().optional(),
});

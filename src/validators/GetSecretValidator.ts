import { z } from "zod";

export const paramsSchema = z.object({
  id: z.uuid({ message: "ID must be a valid UUID" }),
});

export const querySchema = z.object({
  password: z.string({ message: "Password must be a string" }).optional(),
});

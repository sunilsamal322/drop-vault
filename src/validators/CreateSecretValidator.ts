import { z } from "zod";
import { SecretTypeEnum } from "../enums/SecretType.js";

export const createSecretSchema = z.object({
  type: z.enum(Object.values(SecretTypeEnum), {
    message: `Type must be one of: ${Object.values(SecretTypeEnum).join(", ")}`,
  }),
  content: z
    .string()
    .min(1, { message: "Content must be at least 1 character long" })
    .max(10000, { message: "Content must be at most 10000 characters long" }),
  password: z
    .string()
    .min(4, { message: "Password must be at least 4 characters long" })
    .optional(),
  maxViews: z
    .number()
    .positive({ message: "Max views must be a positive number" })
    .optional(),
  expiresAt: z.date({ message: "Expires at must be a valid date" }).optional(),
});

import { Pool } from "pg";
import { env } from "../configs/env.js";

export const postgres = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});

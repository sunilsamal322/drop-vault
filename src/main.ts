import "dotenv/config";
import express from "express";
import { startWorkers } from "./bullmq/workers/index.js";
import { env } from "./configs/env.js";
import { logger } from "./configs/logger.js";
import { redis } from "./configs/redis.js";
import HealthController from "./controllers/HealthController.js";
import SecretController from "./controllers/SecretController.js";
import { postgres } from "./database/postgres.js";
import SecretCleanupJob from "./jobs/SecretCleanupJob.js";
import errorHandler from "./middlewares/ErrorHandler.js";
import { rateLimiter } from "./middlewares/RateLimiter.js";
import requestLogger from "./middlewares/RequestLogger.js";
import AESEncryptionProvider from "./providers/AESEncryptionProvider.js";
import BcryptPasswordHasher from "./providers/BcryptPasswordHasher.js";
import PostgresSecretRepository from "./repositories/PostgresSecretRepository.js";
import secretRoutes from "./routes/secretRoutes.js";
import SecretCleanupScheduler from "./schedulers/SecretCleanupScheduler.js";
import SecretService from "./services/SecretService.js";

const app = express();

app.use(express.json());

app.use(requestLogger);

app.use(rateLimiter);

const repository = new PostgresSecretRepository(postgres);
const encryptionProvider = new AESEncryptionProvider(env.ENCRYPTION_KEY!);
const passwordHasher = new BcryptPasswordHasher();

const secretService = new SecretService(
  repository,
  encryptionProvider,
  passwordHasher,
);

const secretController = new SecretController(secretService);
const healthController = new HealthController(postgres);

app.use("/api/secrets", secretRoutes(secretController));

app.get("/health", healthController.check);

app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

const PORT = env.PORT;

async function bootstrap(): Promise<void> {
  try {
    await connectDatabase();
    await connectRedis();

    startWorkers();

    new SecretCleanupScheduler().start();

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to connect to database");

    process.exit(1);
  }
}

async function waitForDatabase(): Promise<void> {
  for (let i = 1; i <= 10; i++) {
    try {
      await postgres.query("SELECT 1");
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error("Database unavailable");
}

async function connectDatabase(): Promise<void> {
  await waitForDatabase();
  logger.info("Database connected");
}

async function waitForRedis(): Promise<void> {
  const maxRetries = 10;
  for (let i = 1; i <= maxRetries; i++) {
    try {
      await redis.ping();
      return;
    } catch {
      logger.warn({ attempt: i, maxRetries }, "Waiting for Redis...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error("Redis unavailable");
}

async function connectRedis(): Promise<void> {
  await waitForRedis();
  logger.info("Redis connected");
}

bootstrap();

import "dotenv/config";
import express from "express";
import { env } from "./configs/env.js";
import { postgres } from "./database/postgres.js";
import SecretController from "./controllers/SecretController.js";
import secretRoutes from "./routes/secretRoutes.js";
import SecretService from "./services/SecretService.js";
import PostgresSecretRepository from "./repositories/PostgresSecretRepository.js";
import AESEncryptionProvider from "./providers/AESEncryptionProvider.js";
import BcryptPasswordHasher from "./providers/BcryptPasswordHasher.js";
import errorHandler from "./middlewares/ErrorHandler.js";
import requestLogger from "./middlewares/RequestLogger.js";
import { logger } from "./configs/logger.js";
import { rateLimiter } from "./middlewares/RateLimiter.js";
import SecretCleanupJob from "./jobs/SecretCleanupJob.js";

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

app.use("/api/secrets", secretRoutes(secretController));

app.get("/health", (_, res) => {
  res.json({
    status: "ok",
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

const PORT = env.PORT;

async function bootstrap(): Promise<void> {
  try {
    await postgres.query("SELECT 1");

    logger.info("Datbase Connected");

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to connect to database");

    process.exit(1);
  }
}

const cleanupJob = new SecretCleanupJob(repository);

try {
  await cleanupJob.run();
} catch (error) {
  logger.error({ err: error }, "Failed to run cleanup job");
}

setInterval(
  async () => {
    await cleanupJob.run();
  },
  60 * 60 * 1000,
);

bootstrap();

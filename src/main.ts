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

const app = express();

app.use(express.json());

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

app.use(errorHandler);

const PORT = env.PORT;

async function bootstrap(): Promise<void> {
  try {
    await postgres.query("SELECT 1");

    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database", error);

    process.exit(1);
  }
}

bootstrap();

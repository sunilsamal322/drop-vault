import AppError from "./AppError.js";

export default class SecretNotFoundError extends AppError {
  constructor(secretId: string) {
    super(`Secret with ID ${secretId} not found`, 404);
  }
}

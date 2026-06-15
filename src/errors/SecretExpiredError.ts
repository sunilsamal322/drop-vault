import AppError from "./AppError.js";

export default class SecretExpiredError extends AppError {
  constructor(secretId: string) {
    super(`Secret with ID ${secretId} has expired`, 410);
  }
}

import AppError from "./AppError.js";

export default class ViewLimitExceedError extends AppError {
  constructor(secretId: string) {
    super(`View limit exceeded for secret with ID ${secretId}`, 403);
  }
}

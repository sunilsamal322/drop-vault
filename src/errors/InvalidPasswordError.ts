import AppError from "./AppError.js";

export default class InvalidPasswordError extends AppError {
  constructor(message: string = "Invalid password") {
    super(message, 401);
  }
}

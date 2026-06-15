import { PasswordHasher } from "./PasswordHasher.js";
import bcrypt from "bcrypt";

export default class BcryptPasswordHasher implements PasswordHasher {
  public async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  public async compare(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

import Secret from "./entities/Secret.js";
import { SecretTypeEnum } from "./enums/SecretType.js";
import InMemorySecretRepository from "./repositories/InMemorySecretRepository.js";
import SecretService from "./services/SecretService.js";

const secretService = new SecretService(new InMemorySecretRepository());

const secret = new Secret(
  "1",
  SecretTypeEnum.TEXT,
  new Date(),
  0,
  new Date(Date.now() + 1000 * 60 * 60),
  5,
);


const data = await secretService.save(secret);
console.log("Saved secret:", data);

const retrievedSecret = await secretService.getById("1");
console.log("Retrieved secret:", retrievedSecret);

await secretService.deleteById("1");
console.log("Deleted secret with ID 1");

const deletedSecret = await secretService.getById("1");
console.log("Trying to retrieve deleted secret:", deletedSecret);
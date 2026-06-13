import Secret from "./entities/Secret.js";
import { SecretTypeEnum } from "./enums/SecretType.js";
import AESEncryptionProvider from "./providers/AESEncryptionProvider.js";
import Base64EncryptionProvider from "./providers/Base64EncryptionProvider.js";
import InMemorySecretRepository from "./repositories/InMemorySecretRepository.js";
import SecretService from "./services/SecretService.js";

const secretService = new SecretService(
  new InMemorySecretRepository(),
  new AESEncryptionProvider("Testing key"),
);

const data = await secretService.save({
  type: SecretTypeEnum.TEXT,
  content: "My Message",
  expiresAt: new Date(Date.now() + 1000 * 1), // Expires in 1 second
  maxViews: 2,
});

console.log("Saved secret:", data);

const retrievedSecret1 = await secretService.getById(data.id);
console.log("Retrieved secret:", retrievedSecret1);

await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

const retrievedSecret2 = await secretService.getById(data.id);
console.log("Retrieved secret:", retrievedSecret2);

// await secretService.deleteById(data.id);
// console.log("Deleted secret with ID", data.id);

// const deletedSecret = await secretService.getById(data.id);
// console.log("Trying to retrieve deleted secret:", deletedSecret);

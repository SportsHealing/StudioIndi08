// Unscrambles a file made by encrypt-file.mjs. Used when changing the access code:
// decrypt with the old code, then encrypt again with the new one.
// Usage (run from the project root):
//   ACCESS_CODE="OLD-CODE" node scripts/decrypt-file.mjs src/private/statement.enc /tmp/plain.pdf

import { readFileSync, writeFileSync } from "node:fs";
import { pbkdf2Sync, createDecipheriv } from "node:crypto";

const [input, output] = process.argv.slice(2);
const code = (process.env.ACCESS_CODE || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

if (!input || !output || !code) {
  console.error("Usage: ACCESS_CODE=... node scripts/decrypt-file.mjs <input.enc> <output>");
  process.exit(1);
}

const bytes = readFileSync(input);
if (bytes.subarray(0, 4).toString() !== "SI08") {
  console.error("That file was not made by encrypt-file.mjs");
  process.exit(1);
}
const salt = bytes.subarray(4, 20);
const iv = bytes.subarray(20, 32);
const data = bytes.subarray(32, bytes.length - 16);
const tag = bytes.subarray(bytes.length - 16);
const key = pbkdf2Sync(code, salt, 300000, 32, "sha256");
const decipher = createDecipheriv("aes-256-gcm", key, iv);
decipher.setAuthTag(tag);

try {
  writeFileSync(output, Buffer.concat([decipher.update(data), decipher.final()]));
  console.log(`Decrypted ${input} -> ${output}`);
} catch {
  console.error("Wrong code, or the file is damaged.");
  process.exit(1);
}

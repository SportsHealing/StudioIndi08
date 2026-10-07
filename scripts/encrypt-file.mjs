// Encrypts a file with an access code so it can live safely in a public repository.
// Usage (run from the project root):
//   ACCESS_CODE="XXXX-XXXX-XXXX" node scripts/encrypt-file.mjs path/to/input.pdf src/private/statement.enc
//
// The browser page at /private/ uses the same method to decrypt it.
// Format of the output file: "SI08" + 16 byte salt + 12 byte IV + ciphertext + 16 byte auth tag.

import { readFileSync, writeFileSync } from "node:fs";
import { pbkdf2Sync, randomBytes, createCipheriv } from "node:crypto";

const [input, output] = process.argv.slice(2);
const code = (process.env.ACCESS_CODE || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

if (!input || !output || !code) {
  console.error("Usage: ACCESS_CODE=... node scripts/encrypt-file.mjs <input> <output>");
  process.exit(1);
}

const salt = randomBytes(16);
const iv = randomBytes(12);
const key = pbkdf2Sync(code, salt, 300000, 32, "sha256");
const cipher = createCipheriv("aes-256-gcm", key, iv);
const encrypted = Buffer.concat([cipher.update(readFileSync(input)), cipher.final(), cipher.getAuthTag()]);

writeFileSync(output, Buffer.concat([Buffer.from("SI08"), salt, iv, encrypted]));
console.log(`Encrypted ${input} -> ${output} (${encrypted.length} bytes)`);

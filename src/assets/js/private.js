// Decrypts a file in the browser using the access code the visitor types in.
// The encrypted file is made by scripts/encrypt-file.mjs. The code itself is never stored anywhere on the site.

const FILE_URL = "/private/statement.enc";
const form = document.querySelector("#code-form");
const status = document.querySelector("#status");
const viewer = document.querySelector("#viewer");
const frame = viewer.querySelector("iframe");
const download = document.querySelector("#download");

function normalise(code) {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

async function deriveKey(code, salt) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 300000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
}

async function decryptFile(code) {
  const response = await fetch(FILE_URL, { cache: "no-store" });
  if (!response.ok) throw new Error("File not found");
  const bytes = new Uint8Array(await response.arrayBuffer());
  const salt = bytes.slice(4, 20);
  const iv = bytes.slice(20, 32);
  const data = bytes.slice(32);
  const key = await deriveKey(code, salt);
  return crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const code = normalise(form.code.value);
  status.className = "status";
  status.textContent = "Checking the code…";

  try {
    const plain = await decryptFile(code);
    const url = URL.createObjectURL(new Blob([plain], { type: "application/pdf" }));
    frame.src = url;
    download.href = url;
    viewer.hidden = false;
    form.hidden = true;
    status.textContent = "";
    frame.focus();
  } catch (error) {
    status.className = "status error";
    status.textContent = "That code is not right. Check it and try again.";
  }
});

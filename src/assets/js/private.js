// Decrypts the files on this page in the browser using the access code the visitor types in.
// Each file is made by scripts/encrypt-file.mjs. The code itself is never stored anywhere on the site.
// To add a file: encrypt it, then add a <section class="file"> with data-src and data-name in private/index.njk.

const form = document.querySelector("#code-form");
const status = document.querySelector("#status");
const viewer = document.querySelector("#viewer");
const files = Array.from(viewer.querySelectorAll(".file"));

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

async function decryptFile(url, code) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("File not found: " + url);
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
    // Decrypt every file first. If any fails, nothing is shown.
    const results = await Promise.all(files.map((file) => decryptFile(file.dataset.src, code)));

    files.forEach((file, i) => {
      const url = URL.createObjectURL(new Blob([results[i]], { type: "application/pdf" }));
      file.querySelector("iframe").src = url;
      const link = file.querySelector("a");
      link.href = url;
      link.download = file.dataset.name;
    });

    viewer.hidden = false;
    form.hidden = true;
    status.textContent = "";
    files[0].querySelector("h2").setAttribute("tabindex", "-1");
    files[0].querySelector("h2").focus();
  } catch (error) {
    status.className = "status error";
    status.textContent = "That code is not right. Check it and try again.";
  }
});

/**
 * Gera webdist/ para publish (HTML/CSS + app.js ofuscado leve + fonts/vendor).
 */
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  rmSync,
  existsSync,
  readdirSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "webdist");

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit", shell: true });
  if (r.status !== 0) process.exit(r.status || 1);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

cpSync(join(root, "index.html"), join(out, "index.html"));
cpSync(join(root, "styles.css"), join(out, "styles.css"));

if (existsSync(join(root, "fonts"))) {
  cpSync(join(root, "fonts"), join(out, "fonts"), { recursive: true });
}
if (existsSync(join(root, "vendor"))) {
  cpSync(join(root, "vendor"), join(out, "vendor"), { recursive: true });
}

run("npx", [
  "--yes",
  "javascript-obfuscator",
  "app.js",
  "--output",
  "webdist/app.js",
  "--compact",
  "true",
  "--control-flow-flattening",
  "false",
  "--dead-code-injection",
  "false",
  "--string-array",
  "false",
  "--self-defending",
  "false",
  "--rename-globals",
  "false",
  "--identifier-names-generator",
  "hexadecimal",
]);

console.log("webdist ok:", readdirSync(out).join(", "));

const { execFileSync, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env.local");
const requiredKeys = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "RESEND_API_KEY",
  "RESEND_FROM",
  "GROQ_API_KEY"
];
const environments = ["production", "preview", "development"];

if (!fs.existsSync(envPath)) {
  console.error("Missing .env.local. Copy .env.example to .env.local and fill in your real values.");
  process.exit(1);
}

const env = parseEnv(fs.readFileSync(envPath, "utf8"));
const missing = requiredKeys.filter((key) => !env[key]);

if (missing.length) {
  console.error(`Missing values in .env.local: ${missing.join(", ")}`);
  process.exit(1);
}

ensureVercelProject();

for (const key of requiredKeys) {
  for (const target of environments) {
    const result = spawnSync(
      "npx",
      ["--yes", "vercel", "env", "add", key, target],
      {
        cwd: root,
        input: `${env[key]}\n`,
        shell: process.platform === "win32",
        stdio: ["pipe", "inherit", "pipe"]
      }
    );

    const stderr = result.stderr?.toString() || "";

    if (result.status !== 0 && /already exists/i.test(stderr)) {
      console.log(`${key} already exists for ${target}; leaving current Vercel value unchanged.`);
      continue;
    }

    if (result.status !== 0) {
      console.error(stderr);
      process.exit(result.status || 1);
    }

    console.log(`Added ${key} to ${target}.`);
  }
}

console.log("Vercel environment sync complete.");

function ensureVercelProject() {
  try {
    execFileSync("npx", ["--yes", "vercel", "project", "ls"], {
      cwd: root,
      shell: process.platform === "win32",
      stdio: "ignore"
    });
  } catch (error) {
    console.error(
      "Vercel CLI is not logged in or this folder is not linked. Run `npx vercel login`, then `npx vercel link`, then retry `npm run vercel:env`."
    );
    process.exit(1);
  }

  if (!fs.existsSync(path.join(root, ".vercel", "project.json"))) {
    console.error(
      "This folder is not linked to a Vercel project. Run `npx vercel link`, then retry `npm run vercel:env`."
    );
    process.exit(1);
  }
}

function parseEnv(source) {
  const values = {};

  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

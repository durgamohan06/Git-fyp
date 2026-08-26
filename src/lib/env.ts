import fs from "node:fs";
import path from "node:path";

let envLoaded = false;

/**
 * Loads .env variables into process.env from the project root.
 */
export function loadProjectEnv(): void {
  if (typeof process === "undefined" || !process.cwd) return;

  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (!fs.existsSync(envPath)) return;

    const content = fs.readFileSync(envPath, "utf-8");
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const equalIndex = trimmed.indexOf("=");
      if (equalIndex === -1) continue;

      const key = trimmed.slice(0, equalIndex).trim();
      let value = trimmed.slice(equalIndex + 1).trim();

      // Remove surrounding quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    }
    envLoaded = true;
  } catch (err) {
    console.error("Failed to load .env:", err);
  }
}

/**
 * Gets an environment variable, loading .env if not yet loaded.
 */
export function getEnv(key: string, defaultValue = ""): string {
  loadProjectEnv();
  return process.env[key] || defaultValue;
}

// Automatically load once when module is imported
loadProjectEnv();

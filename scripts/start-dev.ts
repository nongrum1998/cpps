import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import readline from "node:readline";

type PackageJson = {
  name?: string;
  scripts?: Record<string, string>;
};

const ROOT = process.cwd();
const APPS_DIR = path.join(ROOT, "apps");

function getApps(): string[] {
  if (!existsSync(APPS_DIR)) {
    return [];
  }

  return readdirSync(APPS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => {
      const packageJsonPath = path.join(APPS_DIR, entry.name, "package.json");

      if (!existsSync(packageJsonPath)) {
        return false;
      }

      const packageJson = JSON.parse(
        readFileSync(packageJsonPath, "utf8"),
      ) as PackageJson;

      return Boolean(packageJson.name && packageJson.scripts?.dev);
    })
    .map((entry) => entry.name)
    .sort();
}

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main(): Promise<void> {
  const apps = getApps();

  if (apps.length === 0) {
    console.error("❌ No apps with a dev script were found.");
    process.exitCode = 1;
    return;
  }

  console.log("\nAvailable apps:\n");

  apps.forEach((app, index) => {
    console.log(`  ${index + 1}. ${app}`);
  });

  console.log("");

  const answer = await ask("Select app: ");
  const index = Number(answer) - 1;

  if (!Number.isInteger(index) || !apps[index]) {
    console.error("❌ Invalid selection.");
    process.exitCode = 1;
    return;
  }

  const app = apps[index];

  console.log(`\n🚀 Starting ${app}...\n`);

  const result = spawnSync("pnpm", ["--filter", app, "dev"], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  process.exitCode = result.status ?? 1;
}

main().catch((error: unknown) => {
  console.error("❌ Failed to start app.");

  if (error instanceof Error) {
    console.error(error.message);
  }

  process.exitCode = 1;
});

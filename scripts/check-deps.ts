#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import semver from "semver";

type DependencyType = "dependencies" | "devDependencies" | "peerDependencies";

type PackageJson = {
  name?: string;
  private?: boolean;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

type WorkspacePackage = {
  name: string;
  directory: string;
  packageJson: PackageJson;
};

type DependencyEntry = {
  packageName: string;
  version: string;
  type: DependencyType;
  workspace: WorkspacePackage;
};

const ROOT = process.cwd();

const DEPENDENCY_TYPES: DependencyType[] = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
];

/**
 * Packages where all workspace consumers should normally use one version.
 *
 * Do NOT put react-native here because this workspace intentionally contains
 * apps using different React Native major/minor lines.
 */
const SINGLE_VERSION_PACKAGES = new Set(["react", "expo", "expo-router"]);

/**
 * Packages where different ranges are allowed as long as they overlap.
 */
const COMPATIBLE_RANGE_PACKAGES = new Set(["axios", "zod", "typescript"]);

/**
 * Shared packages should normally consume these from the application rather
 * than bundle their own copy.
 */
const PEER_ONLY_PACKAGES = new Set(["react", "react-native"]);

let errorCount = 0;
let warningCount = 0;

function error(message: string): void {
  errorCount++;
  console.error(`❌ ${message}`);
}

function warning(message: string): void {
  warningCount++;
  console.warn(`⚠️  ${message}`);
}

function info(message: string): void {
  console.log(`ℹ️  ${message}`);
}

function success(message: string): void {
  console.log(`✅ ${message}`);
}

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

/**
 * Your pnpm-workspace.yaml explicitly defines:
 *
 *   packages:
 *     - "apps/*"
 *     - "packages/*"
 *
 * Keep this list in one place so the checker follows the workspace layout.
 */
const WORKSPACE_PATTERNS = ["apps/*", "packages/*"];

function discoverWorkspacePackages(): WorkspacePackage[] {
  const result: WorkspacePackage[] = [];

  for (const pattern of WORKSPACE_PATTERNS) {
    const baseDirectory = pattern.replace("/*", "");

    const absoluteBase = path.join(ROOT, baseDirectory);

    if (!existsSync(absoluteBase)) {
      continue;
    }

    for (const entry of readdirSync(absoluteBase)) {
      const directory = path.join(absoluteBase, entry);

      if (!statSync(directory).isDirectory()) {
        continue;
      }

      const packageJsonPath = path.join(directory, "package.json");

      if (!existsSync(packageJsonPath)) {
        continue;
      }

      const packageJson = readJson<PackageJson>(packageJsonPath);

      if (!packageJson.name) {
        warning(
          `${path.relative(ROOT, packageJsonPath)} has no package name; skipping.`,
        );
        continue;
      }

      result.push({
        name: packageJson.name,
        directory,
        packageJson,
      });
    }
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}

function collectDependencies(packages: WorkspacePackage[]): DependencyEntry[] {
  const result: DependencyEntry[] = [];

  for (const workspace of packages) {
    for (const type of DEPENDENCY_TYPES) {
      const dependencies = workspace.packageJson[type] ?? {};

      for (const [packageName, version] of Object.entries(dependencies)) {
        result.push({
          packageName,
          version,
          type,
          workspace,
        });
      }
    }
  }

  return result;
}

function groupDependencies(
  entries: DependencyEntry[],
): Map<string, DependencyEntry[]> {
  const groups = new Map<string, DependencyEntry[]>();

  for (const entry of entries) {
    const current = groups.get(entry.packageName) ?? [];

    current.push(entry);

    groups.set(entry.packageName, current);
  }

  return groups;
}

function formatEntry(entry: DependencyEntry): string {
  return `${entry.workspace.name} → ${entry.type}: ${entry.version}`;
}

function checkDuplicateDeclarations(packages: WorkspacePackage[]): void {
  console.log("\n📦 Checking duplicate declarations...\n");

  for (const workspace of packages) {
    const declarations = new Map<string, DependencyType[]>();

    for (const type of DEPENDENCY_TYPES) {
      const dependencies = workspace.packageJson[type] ?? {};

      for (const packageName of Object.keys(dependencies)) {
        const types = declarations.get(packageName) ?? [];

        types.push(type);

        declarations.set(packageName, types);
      }
    }

    for (const [packageName, types] of declarations) {
      if (types.includes("dependencies") && types.includes("devDependencies")) {
        error(
          `${workspace.name}: "${packageName}" exists in both ` +
            `"dependencies" and "devDependencies".`,
        );
      }

      if (
        types.includes("dependencies") &&
        types.includes("peerDependencies")
      ) {
        error(
          `${workspace.name}: "${packageName}" exists in both ` +
            `"dependencies" and "peerDependencies".`,
        );
      }

      /**
       * peerDependencies + devDependencies is valid and expected for
       * shared libraries:
       *
       * peerDependencies → what consumers must provide
       * devDependencies  → what the library needs for local development
       */
      if (
        types.includes("peerDependencies") &&
        types.includes("devDependencies")
      ) {
        info(
          `${workspace.name}: "${packageName}" uses peerDependencies + devDependencies.`,
        );
      }
    }
  }
}

function isLibrary(workspace: WorkspacePackage): boolean {
  return workspace.directory.startsWith(path.join(ROOT, "packages") + path.sep);
}

function checkPeerOnlyPackages(packages: WorkspacePackage[]): void {
  console.log("\n🔗 Checking peer-only packages...\n");

  for (const workspace of packages) {
    if (!isLibrary(workspace)) {
      continue;
    }

    const dependencies = workspace.packageJson.dependencies ?? {};

    for (const packageName of PEER_ONLY_PACKAGES) {
      if (packageName in dependencies) {
        error(
          `${workspace.name}: "${packageName}" is declared in ` +
            `"dependencies". Shared packages should normally declare ` +
            `"${packageName}" as a peer dependency.`,
        );
      }
    }
  }
}

function checkSingleVersion(
  packageName: string,
  entries: DependencyEntry[],
): void {
  const normalDependencies = entries.filter(
    (entry) =>
      entry.type === "dependencies" || entry.type === "devDependencies",
  );

  if (normalDependencies.length <= 1) {
    return;
  }

  const versions = new Set(normalDependencies.map((entry) => entry.version));

  if (versions.size === 1) {
    success(`${packageName}: single version ${normalDependencies[0].version}`);

    return;
  }

  error(`${packageName}: version drift detected.`);

  for (const entry of normalDependencies) {
    console.error(`   ${formatEntry(entry)}`);
  }
}

function rangesOverlap(first: string, second: string): boolean {
  const firstRange = semver.validRange(first);
  const secondRange = semver.validRange(second);

  if (!firstRange || !secondRange) {
    return false;
  }

  /**
   * Generate representative versions from both ranges.
   */
  const candidates = new Set<string>();

  const firstMin = semver.minVersion(firstRange);
  const secondMin = semver.minVersion(secondRange);

  if (firstMin) {
    candidates.add(firstMin.version);
  }

  if (secondMin) {
    candidates.add(secondMin.version);
  }

  /**
   * Test a practical version grid around the lower bounds.
   *
   * This catches common cases such as:
   *
   *   ^1.13.0
   *   ~1.19.0
   *
   * while allowing genuinely overlapping ranges.
   */
  const minimumMajor = Math.max(firstMin?.major ?? 0, secondMin?.major ?? 0);

  for (let major = minimumMajor; major <= minimumMajor + 2; major++) {
    for (let minor = 0; minor <= 50; minor++) {
      for (const patch of [0, 1, 10]) {
        const candidate = `${major}.${minor}.${patch}`;

        if (
          semver.satisfies(candidate, firstRange) &&
          semver.satisfies(candidate, secondRange)
        ) {
          return true;
        }
      }
    }
  }

  return [...candidates].some(
    (candidate) =>
      semver.satisfies(candidate, firstRange) &&
      semver.satisfies(candidate, secondRange),
  );
}

function checkCompatibleRanges(
  packageName: string,
  entries: DependencyEntry[],
): void {
  const normalDependencies = entries.filter(
    (entry) =>
      entry.type === "dependencies" || entry.type === "devDependencies",
  );

  if (normalDependencies.length <= 1) {
    return;
  }

  for (const entry of normalDependencies) {
    if (!semver.validRange(entry.version)) {
      error(`${formatEntry(entry)} contains an invalid semver range.`);
    }
  }

  for (let i = 0; i < normalDependencies.length; i++) {
    for (let j = i + 1; j < normalDependencies.length; j++) {
      const first = normalDependencies[i];
      const second = normalDependencies[j];

      if (!rangesOverlap(first.version, second.version)) {
        error(
          `${packageName}: incompatible version ranges.\n` +
            `   ${formatEntry(first)}\n` +
            `   ${formatEntry(second)}`,
        );
      }
    }
  }
}

function checkPeerDependencies(
  packages: WorkspacePackage[],
  grouped: Map<string, DependencyEntry[]>,
): void {
  console.log("\n🔌 Checking peer dependency compatibility...\n");

  for (const workspace of packages) {
    const peers = workspace.packageJson.peerDependencies ?? {};

    for (const [packageName, peerRange] of Object.entries(peers)) {
      if (!semver.validRange(peerRange)) {
        error(
          `${workspace.name}: invalid peer range for "${packageName}": ${peerRange}`,
        );

        continue;
      }

      const providers = (grouped.get(packageName) ?? []).filter(
        (entry) =>
          entry.type === "dependencies" || entry.type === "devDependencies",
      );

      if (providers.length === 0) {
        warning(
          `${workspace.name}: peer "${packageName}" has no workspace provider.`,
        );

        continue;
      }

      for (const provider of providers) {
        /**
         * Exact versions can be checked directly.
         *
         * Ranges are checked using their minimum satisfiable version.
         */
        const providerVersion = semver.valid(provider.version)
          ? provider.version
          : semver.minVersion(provider.version)?.version;

        if (!providerVersion) {
          warning(
            `${formatEntry(provider)} could not be resolved to a concrete version.`,
          );

          continue;
        }

        if (!semver.satisfies(providerVersion, peerRange)) {
          error(
            `${workspace.name}: peer dependency mismatch for "${packageName}".\n` +
              `   peer range: ${peerRange}\n` +
              `   provider:   ${formatEntry(provider)}\n` +
              `   checked:    ${providerVersion}`,
          );
        }
      }
    }
  }
}

function checkPolicies(grouped: Map<string, DependencyEntry[]>): void {
  console.log("\n📐 Checking dependency policies...\n");

  for (const [packageName, entries] of grouped) {
    if (SINGLE_VERSION_PACKAGES.has(packageName)) {
      checkSingleVersion(packageName, entries);
      continue;
    }

    if (COMPATIBLE_RANGE_PACKAGES.has(packageName)) {
      checkCompatibleRanges(packageName, entries);
    }
  }
}

function checkWorkspaceDependencies(
  packages: WorkspacePackage[],
  entries: DependencyEntry[],
): void {
  console.log("\n🔗 Checking workspace package references...\n");

  const workspaceNames = new Set(packages.map((workspace) => workspace.name));

  for (const entry of entries) {
    if (!workspaceNames.has(entry.packageName)) {
      continue;
    }

    if (!entry.version.startsWith("workspace:")) {
      warning(
        `${formatEntry(entry)} references a workspace package without workspace: protocol.`,
      );
    }
  }
}

function main(): void {
  console.log("🔍 Checking pnpm workspace dependencies...\n");

  const packages = discoverWorkspacePackages();

  if (packages.length === 0) {
    throw new Error("No workspace packages found under apps/* or packages/*.");
  }

  console.log(`Found ${packages.length} workspace package(s):`);

  for (const workspace of packages) {
    console.log(`   • ${workspace.name}`);
  }

  const entries = collectDependencies(packages);
  const grouped = groupDependencies(entries);

  checkDuplicateDeclarations(packages);
  checkPeerOnlyPackages(packages);
  checkPolicies(grouped);
  checkPeerDependencies(packages, grouped);
  checkWorkspaceDependencies(packages, entries);

  console.log("\n────────────────────────────────────────");
  console.log("Dependency check summary");
  console.log("────────────────────────────────────────");

  console.log(`Packages:  ${packages.length}`);
  console.log(`Errors:    ${errorCount}`);
  console.log(`Warnings:  ${warningCount}`);

  if (errorCount > 0) {
    console.error("\n❌ Dependency check FAILED.");
    process.exitCode = 1;
    return;
  }

  console.log("\n✅ Dependency check PASSED.");
}

try {
  main();
} catch (error) {
  console.error("\n❌ Dependency checker crashed.");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exitCode = 1;
}

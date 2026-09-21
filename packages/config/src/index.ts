/**
 * @pension/config — shared configuration types for the workspace.
 *
 * Skeleton package. Intended to hold cross-package configuration schema
 * (env contracts, feature flags, build variants). Exports are minimal until
 * the actual config surfaces are extracted from the app.
 */

/** Identifies a workspace package (name + version) for tooling and logging. */
export interface WorkspacePackageInfo {
  /** npm package name, e.g. "@pension/config". */
  name: string;
  /** Semantic version of the package. */
  version: string;
}

/** Metadata describing this package. */
export const PACKAGE_INFO: WorkspacePackageInfo = {
  name: '@pension/config',
  version: '0.0.0',
};

import { APP_NAME, APP_SLUG, APP_VERSION } from '@pension/core';

/**
 * App-level identity surfaced through the shared config barrel.
 *
 * Re-exports the workspace-level identity constants from `@pension/core`
 * so app code keeps importing from `@config/*` while the values stay
 * defined once in the workspace package.
 */
export { APP_NAME, APP_SLUG, APP_VERSION };

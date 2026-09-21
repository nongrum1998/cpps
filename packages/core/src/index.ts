/**
 * @pension/core — shared identity constants for the workspace.
 *
 * Source of truth for app-level identity (display name, Expo slug) that
 * packages and the mobile app can import without duplicating strings.
 */

/** Human-readable app display name used across the product ("Pension"). */
export const APP_NAME = 'Pension';

/** Expo project slug (matches `app.config.ts` `slug`). */
export const APP_SLUG = 'cssp';

/** Current semantic version of the mobile app (matches `app.config.ts`). */
export const APP_VERSION = '3.0.0';

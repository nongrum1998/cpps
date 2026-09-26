/**
 * App-level icon re-export.
 *
 * The `Icon` primitive and its `IconName` map now live in the shared
 * `@pension/ui` package so package-level components (such as `EmptyScreen`)
 * can render icons without depending on app-local code.
 *
 * This module re-exports them so the app's existing `@components/ui` import
 * path keeps resolving. New code should import from `@pension/ui` directly.
 */
export { Icon, type IconName } from '@pension/ui';

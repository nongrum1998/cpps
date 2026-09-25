import { LoadingScreen as GlobalLoading } from '@pension/ui';

/**
 * App-level loading screen.
 *
 * Thin re-export of the shared {@link GlobalLoading} primitive from
 * `@pension/ui`, exposed under the app's `@components/screens` alias so
 * feature screens have a single import path for common screens.
 *
 * Declared as a component (`() => <GlobalLoading />`) rather than a bare
 * element (`<GlobalLoading />`). A bare element would evaluate once at module
 * load and be a fixed `Element` value, which cannot be mounted as `<LoadingScreen />`
 * and loses the parent-tree context it is rendered in.
 *
 * @example
 * if (isLoading) return <LoadingScreen />;
 */
export const LoadingScreen = () => <GlobalLoading />;

// Learn more https://docs.expo.io/guides/customing-metro
const path = require('path');

const { getDefaultConfig } = require('expo/metro-config');

const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */

const config = getDefaultConfig(__dirname);

/**
 * Resolve bare package imports from this app's own `node_modules` first.
 *
 * Why this is required: this workspace hosts two React Native majors at once
 * (this app is on the Expo 54 / RN 0.81 line, its siblings are on Expo 57 /
 * RN 0.86). pnpm keeps a store-wide hidden hoist at
 * `node_modules/.pnpm/node_modules`, and Metro builds its search path by
 * walking *up from the importing file* before consulting the app's own
 * `node_modules`. An import that nothing in the chain declares therefore
 * escapes this app's dependency graph and resolves in the shared hoist, on
 * the sibling apps' SDK generation. In this app that silently pulled in
 * `react-native@0.86.3`, `expo-constants@57.x` and
 * `react-native-css-interop@0.2.6`, and Metro codegen then failed with
 * "Unable to determine event arguments for onModeChange".
 *
 * Note that `resolver.extraNodeModules` cannot fix this: Metro consults it
 * only after the upward walk, so it never overrides a hoist hit.
 *
 * Instead, bare specifiers are resolved once with the search root pinned to
 * this app, which keeps Metro's own resolution semantics (main fields,
 * platform extensions, `exports` conditions) while making the walk start at
 * `apps/eis/node_modules` — a path from which the shared hoist is not
 * reachable. Anything this app does not provide falls back to the original
 * importer so nested packages keep resolving their own declared dependencies.
 */
const APP_ROOT_ORIGIN = path.join(__dirname, 'package.json');

const previousResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = function resolveRequest(context, moduleName, platform) {
  // Relative, absolute and virtual (asset/CSS) specifiers must keep Metro's
  // normal behaviour, which is relative to the importing file.
  const isBareSpecifier =
    !moduleName.startsWith('.') && !path.isAbsolute(moduleName);

  if (isBareSpecifier) {
    const resolve = previousResolveRequest ?? context.resolveRequest;
    try {
      return resolve(
        { ...context, originModulePath: APP_ROOT_ORIGIN },
        moduleName,
        platform
      );
    } catch {
      // Not provided by this app; fall through to the importing file so the
      // package can still resolve its own declared dependencies.
    }
  }

  const resolve = previousResolveRequest ?? context.resolveRequest;
  return resolve(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './src/shared/styles/global.css' });

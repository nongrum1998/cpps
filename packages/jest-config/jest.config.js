/**
 * Shared Jest config for the workspace apps (apps/cpps, apps/pension).
 *
 * Consumers wire it in with:
 *   module.exports = require('@pension/jest-config/jest.config.js');
 *
 * Each app keeps its own thin jest.config.js at its root so that Jest derives
 * rootDir from that file and <rootDir> placeholders, `preset` (`jest-expo`)
 * and `resolver` (`react-native-worklets/jest/resolver`) all resolve against
 * the app's own directory. `preset` and `resolver` are therefore resolved
 * from each app's node_modules, so this package declares no dependencies.
 */
module.exports = {
  preset: 'jest-expo',
  watchman: false,
  testMatch: [
    '<rootDir>/src/features/**/test/**/*.(test|spec).{js,jsx,ts,tsx}',
    '<rootDir>/src/shared/**/test/**/*.(test|spec).{js,jsx,ts,tsx}',
  ],
  resolver: 'react-native-worklets/jest/resolver',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|jail-monkey))',
    '/node_modules/react-native-reanimated/plugin/',
    '/node_modules/@react-native/babel-preset/',
  ],
};
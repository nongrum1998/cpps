import { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Application variant determined by the `APP_VARIANT` environment variable.
 * Controls which build profile is active: development, preview, or production.
 * When unset, defaults to `undefined` which maps to the production profile.
 */
const APP_VARIANT = process.env.EXPO_PUBLIC_APP_VARIANT;

/** Whether the current build targets the development environment. */
const isDev = APP_VARIANT === 'development';

/** Whether the current build targets the preview/staging environment. */
const isPreview = APP_VARIANT === 'preview';

/** Semantic version of the application. Must match the version in `eas.json`. */
const APP_VERSION = '1.0.0';

/**
 * Asset file paths used across iOS and Android configurations.
 * All paths are relative to the project root.
 */
const ASSETS = {
  /** Default iOS app icon displayed on the home screen and Settings. */
  iosIcon: './src/shared/assets/ios-icon-default.png',
  /** iOS splash screen image shown during app launch. */
  iosSplash: './src/shared/assets/ios-icon-default.png',
  /** Foreground image for the Android adaptive icon (masked by the system shape). */
  androidIconForeground: './src/shared/assets/android-icon-foreground.png',
  /** Android splash screen image displayed during app launch. */
  androidSplash: './src/shared/assets/ios-icon-default.png',
} as const;

/** Shared background color used for splash screens and adaptive icon backgrounds. */
const iconBgColor = '#ffffff';

/**
 * Returns the application display name, optionally suffixed with the variant
 * label for non-production builds to visually distinguish environments.
 *
 * @param baseName - The base application name (e.g. "EIS").
 * @returns The display name with an environment suffix for dev/preview builds,
 *          or the base name unchanged for production builds.
 */
const getAppName = (baseName: string) => {
  if (isDev) return `${baseName} (Dev)`;
  if (isPreview) return `${baseName} (Preview)`;
  return baseName;
};

/**
 * Returns the iOS bundle identifier or Android package name based on the
 * current build variant. Currently all variants use the same identifier.
 *
 * @returns The fully-qualified reverse-domain identifier.
 */
// TODO: Change when moving to production
const getIdentifier = () => {
  if (isDev) return 'com.jyrwaboys.eis.dev';
  if (isPreview) return 'com.jyrwaboys.eis.preview';
  return 'com.jyrwaboys.eis';
};

/**
 * Expo application configuration.
 *
 * Defines the cross-platform settings for the EIS (Employee Information System)
 * app, including name, version, icons, splash screens, plugins, platform-specific
 * overrides, and EAS Update configuration.
 *
 * The configuration adapts based on the `APP_VARIANT` environment variable:
 * - `development` — App name suffixed with "(Dev)", development client enabled.
 * - `preview` — App name suffixed with "(Preview)", internal distribution.
 * - unset — Production build with the base app name and store distribution.
 *
 * @param config - The base Expo config context provided at export time.
 * @returns The resolved Expo configuration object.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName('EIS'),
  slug: 'eis',
  version: APP_VERSION,
  scheme: 'eis',
  platforms: ['ios', 'android'],
  plugins: [
    'expo-router',
    'expo-splash-screen',
    'expo-font',
    [
      'expo-local-authentication',
      {
        faceIDPermission: 'Allow $(PRODUCT_NAME) to use Biometric authentication.',
      },
    ],
    [
      'expo-notifications',
      {
        icon: ASSETS.androidIconForeground,
        color: iconBgColor,
        defaultChannel: iconBgColor,
        enableBackgroundRemoteNotifications: true,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true,
  },
  orientation: 'portrait', // portrait | default | landscape
  icon: ASSETS.iosIcon,
  userInterfaceStyle: 'light',
  splash: {
    image: ASSETS.iosSplash,
    resizeMode: 'contain',
    backgroundColor: iconBgColor,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: getIdentifier(),
    googleServicesFile: process.env.GOOGLE_SERVICES_PLIST_IOS, // google-service.plist file needed
  },
  android: {
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
    adaptiveIcon: {
      foregroundImage: ASSETS.androidIconForeground,
      backgroundColor: iconBgColor,
    },
    splash: {
      image: ASSETS.androidSplash,
      resizeMode: 'contain',
      backgroundColor: iconBgColor,
    },
    package: getIdentifier(),
  },
  extra: {
    router: {},
    eas: {
      projectId: '2fd849f1-51e3-4a1b-9ece-6d0973d36314',
    },
  },
  owner: 'pixel-thread',
  updates: {
    url: 'https://u.expo.dev/14849a6b-819c-4e05-9b59-022a381d8999',
  },
  runtimeVersion: APP_VERSION,
});

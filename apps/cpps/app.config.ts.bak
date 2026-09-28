import type { ExpoConfig } from 'expo/config';

/**
 * Expo application configuration (app.config.ts).
 *
 * Builds the mobile app manifest for ios + android. The iOS `bundleIdentifier`
 * and Android `package` are computed from the `APP_VARIANT` environment variable,
 * allowing development, preview, and production builds to be installed side by
 * side on the same device using distinct bundle IDs.
 *
 * @package cssp-mobile
 * @see eas.json  (injects APP_VARIANT per build profile)
 */

const bundleIdentifier = 'com.jyrwajr.csspmobile';
const androidPackage = 'com.jyrwajr.csspmobile';

const variant = process.env.APP_VARIANT;

/**
 * Derives the platform bundle identifier for the active build variant.
 *
 * Appends a `.dev` or `.preview` suffix to the base bundle ID when
 * `process.env.APP_VARIANT` is set accordingly. Returns the base ID unchanged
 * when the variant is unset or unknown (production).
 *
 * @param base - The base bundle identifier/package name (e.g. `com.jyrwajr.csspmobile`).
 * @returns The variant-suffixed ID: `<base>.dev`, `<base>.preview`, or the input `base`.
 * @see APP_VARIANT
 */
function getBundleId(base: string): string {
  switch (variant) {
    case 'development':
      return `${base}.dev`;
    case 'preview':
      return `${base}.preview`;
    case 'production':
      return `${base}`;
    default:
      return `${base}.dev`;
  }
}

function getAppName(): string {
  switch (variant) {
    case 'development':
      return `CPPS [dev]`;
    case 'preview':
      return `CPPS [Preview]`;
    case 'production':
      return 'CPPS';
    default:
      return `CPPS [dev]`;
  }
}

function getSchemaName(): string {
  switch (variant) {
    case 'development':
      return `cpps-dev`;
    case 'preview':
      return `cpps-preview`;
    case 'production':
      return 'cpps';
    default:
      return `cpps-dev`;
  }
}

const config: ExpoConfig = {
  name: getAppName(),
  slug: 'cssp',
  version: '3.0.0',
  scheme: getSchemaName(),

  platforms: ['ios', 'android'],
  orientation: 'portrait',
  userInterfaceStyle: 'light',

  icon: './src/shared/assets/images/logo.jpg',

  plugins: [
    'expo-router',

    'expo-sharing',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location.',
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './src/shared/assets/images/logo.jpg',
        backgroundColor: '#ffffff',
        dark: {
          image: './src/shared/assets/images/logo.jpg',
          backgroundColor: '#000000',
        },
      },
    ],
    [
      // Plugin: expo-build-properties — lets us pin the native Android/iOS
      // build SDK versions used by the Expo prebuild (gradle + xcode).
      'expo-build-properties',
      {
        // ── ANDROID CONFIG ────────────────────────────────────────────────
        android: {
          // compileSdkVersion = Android SDK 36 = Android 16 (Baklava, 2025)
          // compileSdkVersion is the SDK the app is COMPILED against; it lets
          // the code use the newest Android APIs at build time. Being "newer"
          // does NOT block old devices: Android supports apps built with newer
          // SDKs running on older OS versions (down to minSdkVersion).
          compileSdkVersion: 36,

          // targetSdkVersion = Android SDK 36 = Android 16
          // targetSdkVersion is the Android version whose runtime behavior the
          // app is OPTIMIZED and TESTED for. Google Play now REQUIRES target
          // SDK 35+ (Aug 2025) and 36 (Aug 2026) — 36 keeps the app publishable.
          // Note: target does NOT limit installs — devices on ANY newer Android
          // can still install the app.
          targetSdkVersion: 36,

          // buildToolsVersion = Android SDK Build-Tools 36.0.0 (ships with SDK 36)
          // The AAPT2 / dexer / zipalign toolchain used to actually BUILD the APK.
          // Keep it in sync with compileSdkVersion (36 -> 36.0.0). Output still
          // installs on Android 7.0+ because minSdkVersion governs installs.
          buildToolsVersion: '36.0.0',

          // buildArchs = CPU architectures packaged into the APK/AAB
          //   arm64-v8a    -> 64-bit ARM — ALL modern phones (Android 5.0+)
          //   armeabi-v7a  -> 32-bit ARM — older / low-end phones (Android 4.0+)
          // arm64-v8a is REQUIRED (Play Store mandates 64-bit), armeabi-v7a is
          // kept so older 32-bit devices can still run the app.
          buildArchs: ['arm64-v8a'],

          // minSdkVersion = 24 = Android 7.0 (Nougat, 2016)
          // The LOWEST Android version the app supports — devices below it
          // cannot install the app. "android - 7.0 >" is the supported range.
          // 24 is a safe floor: ~98%+ of active Android devices are 7.0+.
          minSdkVersion: 24,

          // enableMinifyInReleaseBuilds -> runs R8 code shrinker in release
          // builds only. Removes unused code + shortens identifiers, so the
          // APK is smaller and loads faster. No effect on debug builds.
          enableMinifyInReleaseBuilds: true,

          // enableShrinkResourcesInReleaseBuilds -> removes unused resources
          // (drawables, layouts, strings) in release builds, shrinking the APK
          // further. Must be used together with minify/R8 for correct analysis.
          enableShrinkResourcesInReleaseBuilds: true,

          // usesCleartextTraffic: false -> FORBID plain http:// on ALL Android
          // versions; only https:// is allowed. Protects the cppser photo
          // and PII in transit. (Android 9/API 28+ blocks cleartext by default;
          // this also enforces it on 7.x/8.x devices -> fail-secure.)
          usesCleartextTraffic: variant !== 'production' ? true : false,
        },

        // ── iOS CONFIG ────────────────────────────────────────────────────
        ios: {
          // deploymentTarget = iOS 16.4 (released March 2023)
          // The LOWEST iOS version the app supports — devices on older iOS
          // cannot install from the App Store. "ios - 16.4 >" is the range.
          // Installable iPhones: 8, 8 Plus, X (2017) and newer — including
          // Xs/Xr/11/SE2/12/13/SE3/14/15/16 series. Lower target = more old
          // devices supported; higher target = fewer iOS version checks needed.
          deploymentTarget: '16.4',
        },
      },
    ],
    'expo-secure-store',
  ],

  experiments: {
    typedRoutes: true,
    tsconfigPaths: true,
  },

  assetBundlePatterns: ['src/shared/assets/**/*'],

  ios: {
    supportsTablet: true,

    bundleIdentifier: getBundleId(bundleIdentifier),

    infoPlist: {
      NSCameraUsageDescription: 'CSSP Mobile needs access to your camera for photo verification.',
    },
  },

  android: {
    package: getBundleId(androidPackage),
    permissions: ['android.permission.CAMERA'],

    adaptiveIcon: {
      foregroundImage: './src/shared/assets/images/logo.jpg',
      backgroundColor: '#ffffff',
    },
  },

  updates: {
    url: 'https://u.expo.dev/9ac6a35c-06b5-445c-8227-37951817b496',
    checkAutomatically: 'ON_LOAD',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  extra: {
    eas: {
      projectId: '9ac6a35c-06b5-445c-8227-37951817b496',
    },
  },
  owner: 'pixel-thread',
};

/**
 * Expo configuration for the cssp-mobile application.
 *
 * Applies platform-specific bundle identifiers and Android/iOS packages derived
 * from the {@link getBundleId} variant logic, plus the app icon, splash screen,
 * camera permission copy, and EAS project linkage.
 */
export default config;

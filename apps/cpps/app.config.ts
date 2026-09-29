// `tsx/cjs` registers a CommonJS require hook for TypeScript, which is what
// lets this file import the raw-TypeScript @pension/expo-config package.
// Expo's config loader transpiles only the entry app.config.ts and installs no
// hook of its own, so without this the import below fails to resolve.
// Must stay the FIRST import in the file.
import 'tsx/cjs';
import { createAppConfig } from '@pension/expo-config';
import { ExpoConfig } from 'expo/config';

const config = createAppConfig({
  appName: 'cssp',
  slug: 'cssp',
  scheme: 'cssp',
  baseBundleIdentifier: 'com.jyrwajr.csspmobile',
  projectId: '9ac6a35c-06b5-445c-8227-37951817b496',
  owner: 'pixel-thread',
  icon: './src/shared/assets/images/logo.jpg',
  version: '1.0.0',
  cameraUsageDescription: 'Face Verification usage',
  plugins: [
    'expo-sharing',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location.',
      },
    ],
  ],
});

export default config as ExpoConfig;

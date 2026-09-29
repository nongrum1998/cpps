import { env } from '@utils/env';
import React from 'react';
import { View, Text } from 'react-native';

interface AuthLoginHeaderProps {
  title: string;
  subtitle?: string;
}

/**
 * Branded login header matching the Stitch mockup.
 *
 * Renders:
 * 1. Indian tricolor gradient strip (6px)
 * 2. Institutional branding bar (60px) with `business-outline` icon
 *    and "GovAuth India" heading
 * 3. Centered page title and subtitle
 *
 * This component is auth-screen-specific and intentionally does NOT replace
 * the shared `GovtHeader` component used on other screens.
 *
 * @example
 * ```tsx
 * <AuthLoginHeader title="Authentication" subtitle="Please sign in to continue" />
 * ```
 */
export const AuthLoginHeader = ({ title, subtitle }: AuthLoginHeaderProps) => (
  <View className="mb-8 items-center">
    <View className="gap-y-2">
      <Text className="text-center text-2xl font-medium tracking-[2px] text-primary">
        {env.EXPO_PUBLIC_APP_NAME}
      </Text>
      <Text className="text-center text-3xl font-bold tracking-[4px]">{title}</Text>
      {subtitle && <Text className="text-center text-lg text-muted-foreground">{subtitle}</Text>}
    </View>
  </View>
);

import React from 'react';
import { View } from 'react-native';
import { Container } from '@components/layout/container';
import { KeyboardSafeView } from '@components/layout/keyboard-safe-view';
import { Skeleton } from '@components/ui/skeleton';

/**
 * Skeleton placeholder that mimics the AuthLoginHeader component.
 *
 * Renders shimmer bars for the tricolor strip, branding bar (icon + text),
 * title, and subtitle.
 */
const LoginHeaderSkeleton = () => (
  <View>
    {/* Tricolor strip */}
    <Skeleton className="h-[6px] w-full" />
    {/* Branding bar */}
    <View className="border-outline-variant h-[60px] flex-row items-center border-b px-5">
      <Skeleton className="h-6 w-6 rounded" />
      <Skeleton className="ml-2 h-5 w-32 rounded" />
    </View>
    {/* Title section */}
    <View className="mb-8 mt-8 items-center gap-y-2">
      <Skeleton className="h-7 w-40 rounded-md" />
      <Skeleton className="h-5 w-48 rounded" />
    </View>
  </View>
);

/**
 * Skeleton placeholder that mimics a single form field with icon prefix.
 *
 * Used twice — once for Employee Code and once for Password.
 */
const LoginFormFieldSkeleton = () => (
  <View className="my-2">
    <Skeleton className="mb-2 h-4 w-28 rounded" />
    <View className="relative">
      <View className="absolute left-3 top-0 z-10 h-[44px] justify-center">
        <Skeleton className="h-5 w-5 rounded" />
      </View>
      <Skeleton className="h-[44px] w-full rounded-md" />
    </View>
  </View>
);

/**
 * Skeleton placeholder that mimics the "Forgot Password?" link.
 */
const LoginForgotLinkSkeleton = () => (
  <View className="mb-8 items-end">
    <Skeleton className="h-4 w-36 rounded" />
  </View>
);

/**
 * Skeleton placeholder that mimics the Continue button.
 */
const LoginButtonSkeleton = () => <Skeleton className="mb-8 h-[44px] w-full rounded-md" />;

/**
 * Skeleton placeholder that mimics the AuthFooter component.
 */
const LoginFooterSkeleton = () => (
  <View className="mt-10 flex-row items-center justify-center gap-x-1">
    <Skeleton className="h-4 w-40 rounded" />
    <Skeleton className="h-4 w-24 rounded" />
  </View>
);

/**
 * Full-page skeleton loading state for the login screen.
 *
 * Mirrors the layout of LoginScreen with shimmer placeholders for:
 * - AuthLoginHeader (tricolor strip, branding bar, title, subtitle)
 * - Employee Code field (label + icon + input)
 * - Password field (label + icon + input + toggle)
 * - Forgot password link
 * - Continue button
 * - AuthFooter (text + register link)
 *
 * @example
 * ```tsx
 * // In login-screen.tsx:
 * if (isPending) return <LoginScreenSkeleton />;
 * ```
 */
export const LoginScreenSkeleton = () => (
  <Container className="p-0">
    <KeyboardSafeView>
      <LoginHeaderSkeleton />
      <View className="px-5">
        <LoginFormFieldSkeleton />
        <LoginFormFieldSkeleton />
        <LoginForgotLinkSkeleton />
        <LoginButtonSkeleton />
      </View>
      <LoginFooterSkeleton />
    </KeyboardSafeView>
  </Container>
);

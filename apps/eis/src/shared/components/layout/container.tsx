import React from 'react';
import { View } from 'react-native';
import { cn } from '@utils/helpers/cn';

type Props = {
  /** Content to render inside the container. */
  children: React.ReactNode;
  /** Additional Tailwind/NativeWind classes to merge. */
  className?: string;
};

/**
 * Layout container that wraps content with a full-height flex view and the
 * theme-aware background color.
 *
 * - **Light mode:** `bg-background` resolves to `hsl(0 0% 100%)` — pure white canvas
 * - **Dark mode:**  `dark:bg-gray-900` provides an ink-like background (#111827),
 *   keeping the canvas appropriately dark while using a standard Tailwind token.
 *
 * @example
 * ```tsx
 * <Container>
 *   <Text>Page content</Text>
 * </Container>
 * ```
 */
export const Container = ({ children, className }: Props) => {
  return <View className={cn('flex-1 bg-zinc-100 p-4', className)}>{children}</View>;
};

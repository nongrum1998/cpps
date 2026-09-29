import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@utils/helpers/cn';

interface SectionHeaderProps {
  /** The heading text. */
  title: string;
  /** Optional emoji / icon character displayed in a rounded container. */
  icon?: string;
  /** Optional subtitle shown below the title. */
  subtitle?: string;
  /** Optional element rendered on the right side of the header row. */
  rightElement?: React.ReactNode;
  /** Content rendered below the header, only supported in splash variant. */
  children?: React.ReactNode;
  className?: string;
  variant?: 'section' | 'splash';
}

/**
 * SectionHeader renders a section heading with optional icon, subtitle, and right-side content.
 *
 * Two variants:
 * - `section` — A clean heading with a left accent bar, optional icon, and a subtle bottom separator.
 * - `splash` — A full-width banner with rounded bottom corners, suited for page top headers.
 */
export const SectionHeader = ({ title, className }: SectionHeaderProps) => {
  return (
    <View className={cn('my-2', className)}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-sm">
          <View className="h-4 w-0.5 rounded-md bg-primary" />
          <Text className="text-xl font-bold tracking-widest">{title}</Text>
        </View>
      </View>
    </View>
  );
};

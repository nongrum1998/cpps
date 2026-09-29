import React from 'react';
import { View, TouchableOpacity, Switch, Text } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import type { IconSvgElement } from '@hugeicons/react-native';
import { ChevronRightIcon } from '@hugeicons/core-free-icons';
import { cn } from '@utils/helpers/cn';

/** Props for the SettingRow component. */
interface SettingRowProps {
  icon: IconSvgElement;
  label: string;
  description?: string;
  isDestructive?: boolean;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showBorder?: boolean;
  value?: boolean;
  onValueChange?: (val: boolean) => void;
  iconColor?: string;
}

/**
 * Renders a settings row with icon, label, optional description, and a right element (chevron, switch, or custom).
 * Supports destructive styling and press handling for navigation or actions.
 */
export const SettingRow = ({
  icon,
  label,
  description,
  isDestructive,
  onPress,
  rightElement,
  showBorder = true,
  value,
  onValueChange,
  iconColor,
}: SettingRowProps) => {
  const content = (
    <View
      className={cn(
        'flex-row items-center justify-between py-4',
        showBorder ? 'border-b border-border' : ''
      )}>
      <View className="flex-row items-center gap-4">
        <View
          className={cn(
            'items-center justify-center rounded-md p-2',
            isDestructive ? 'bg-red-50 dark:bg-red-900/20' : 'bg-muted'
          )}>
          <HugeiconsIcon
            icon={icon}
            size={20}
            color={iconColor || (isDestructive ? '#EF4444' : '#64748B')}
          />
        </View>
        <View>
          <Text
            className={cn(
              'text-base font-medium',
              isDestructive ? 'text-red-600' : 'text-foreground'
            )}>
            {label}
          </Text>
          {description && <Text className="text-xs text-graphite">{description}</Text>}
        </View>
      </View>

      {rightElement ? (
        rightElement
      ) : onValueChange !== undefined ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
          thumbColor={value ? '#2563EB' : '#F3F4F6'}
          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
        />
      ) : (
        <HugeiconsIcon icon={ChevronRightIcon} size={20} color="#CBD5E1" />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

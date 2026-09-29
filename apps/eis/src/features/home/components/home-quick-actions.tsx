import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { Route, router } from 'expo-router';
import {
  CalendarIcon,
  CalendarUserIcon,
  DocumentAttachmentIcon,
  HelpSquareIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';

/**
 * Quick-action shortcut buttons displayed in a 2x2 grid.
 *
 * Each action shows a rounded icon button with a centered icon and label below.
 * Matches the EIS design — 44px minimum touch targets, 16px card radius.
 */

type QuickAction = {
  title: string;
  icon: any;
  href?: Route;
  primary?: boolean;
};

const quickActions: QuickAction[] = [
  {
    title: 'Apply Leave',
    icon: CalendarUserIcon,
    href: '/leaves',
    primary: true,
  },
  {
    title: 'Holiday List',
    icon: CalendarIcon,
  },
  {
    title: 'Salary Statements',
    icon: DocumentAttachmentIcon,
    href: '/statement',
  },
  {
    title: 'Support',
    icon: HelpSquareIcon,
    primary: true,
  },
];

export const HomeQuickActions = () => {
  return (
    <View className="flex-row flex-wrap justify-between">
      {quickActions.map((item, index) => (
        <Pressable
          key={index}
          onPress={() => item.href && router.push(item.href)}
          className={`mb-4 h-28 w-[48%] items-center justify-center rounded-md ${
            item.primary ? 'bg-primary' : 'border border-gray-200 bg-white'
          }`}>
          <HugeiconsIcon icon={item.icon} size={28} color={item.primary ? '#fff' : '#0036a4'} />

          <Text className={`mt-2 font-semibold ${item.primary ? 'text-white' : 'text-primary'}`}>
            {item.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

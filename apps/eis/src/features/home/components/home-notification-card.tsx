import React from 'react';
import { Text, View } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { NotificationSquareIcon } from '@hugeicons/core-free-icons';
import { formatHomeDate } from '../utils';
import { useHomeOverview } from '../hooks';

/**
 * Compact notification banner shown at the top of the home screen.
 *
 * Displays the single `notification_for_me` record returned by the home
 * overview endpoint: icon, title, body/message, and announcement date.
 * Renders nothing when the record is missing or empty.
 *
 * @example
 * ```tsx
 * <HomeNotificationCard />
 * ```
 */
export const HomeNotificationCard = () => {
  const { data } = useHomeOverview();
  const notification = data?.notification_for_me;

  if (!notification) return null;

  const body = notification.body || notification.message;

  return (
    <View className="mt-6 flex-row items-start gap-x-3 rounded-md border border-border bg-white p-4">
      <HugeiconsIcon icon={NotificationSquareIcon} size={28} color="#0036a4" />
      <View className="flex-1">
        <Text className="text-sm font-bold text-black">{notification.title}</Text>
        {body ? <Text className="mt-0.5 text-sm text-graphite">{body}</Text> : null}
        <Text className="mt-1 text-xs text-gray-500">
          {formatHomeDate(notification.announce_dt)}
        </Text>
      </View>
    </View>
  );
};

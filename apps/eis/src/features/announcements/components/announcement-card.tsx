import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Card } from '@components/ui/card';
import { AnnouncementT } from '../types';
import { formatDate } from '@utils/formatters';

/**
 * Announcement Card Component
 */
export const AnnouncementCard = ({ item }: { item: AnnouncementT }) => {
  return (
    <TouchableOpacity activeOpacity={0.7} className="mb-4">
      <Card variant="bordered" className="p-5">
        <View className="mb-3 flex-row items-center justify-between">
          {item.type === 'UR' && <View className="h-2 w-2 rounded-md bg-primary" />}
        </View>

        <Text className="mb-1 text-sm font-semibold text-foreground">{item.title}</Text>

        <Text numberOfLines={2} className="mb-3 text-sm leading-5 text-muted-foreground">
          {item.body}
        </Text>
        <Text numberOfLines={2} className="mb-3 text-sm leading-5 text-muted-foreground">
          {item.message}
        </Text>

        <View className="flex-row items-center justify-between border-t border-border pt-3">
          <Text className="text-[10px] font-medium text-graphite">
            {formatDate(item.created_at)}
          </Text>
          {item.type === 'UR' && (
            <View className="flex-row items-center">
              <Text className="mr-1 text-xs">⚠️</Text>
              <Text className="text-xs font-bold text-semantic-up">Urgent</Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

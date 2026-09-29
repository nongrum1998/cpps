import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { cn } from '@utils/helpers/cn';
import { getStatusColor } from '@utils/helpers/get-status-color';
import type { LeaveListItem } from '@sharedTypes/leave';
import { useRouter } from 'expo-router';
import { PAGE_ROUTES } from '@utils/constants';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { getStatusIcon } from '@utils/helpers/get-icon';

export function LeaveCard({ item }: { item: LeaveListItem }) {
  const router = useRouter();
  const onPressLeave = () => {
    const { leave_cd, from_dt1, order_dt1 } = item;
    const pageUrl = PAGE_ROUTES.LEAVE.DETAILS({
      leave_cd,
      from_dt: from_dt1,
      order_dt: order_dt1,
    });
    router.push(pageUrl);
  };

  return (
    <TouchableOpacity
      onPress={onPressLeave}
      className="flex-col rounded-md border border-border p-4">
      <View className="mb-3 flex-row items-start justify-between">
        <View>
          <Text className="text-lg font-bold">{item.reason_for_leave}</Text>
          <Text className="text-sm text-primary">{item.leave_desc}</Text>
        </View>
        <View className={cn('rounded-md px-2.5 py-1', getStatusColor(item.verify_flg_desc).bg)}>
          <Text className={cn('text-xs font-medium', getStatusColor(item.verify_flg_desc).text)}>
            {item.verify_flg_desc}
          </Text>
        </View>
      </View>

      <View className="mb-1.5 flex-row items-center">
        <HugeiconsIcon
          icon={getStatusIcon(item.verify_flg_desc)}
          size={18}
          className={cn('mr-2 ', getStatusColor(item.verify_flg_desc).text)}
        />
        <Text className="ml-2 text-base text-graphite">{item.from_dt1}</Text>
      </View>

      <Text className="ml-7 text-sm text-graphite">
        {item.no_days} {parseInt(item.no_days) > 1 ? 'days' : 'day'}
      </Text>
    </TouchableOpacity>
  );
}

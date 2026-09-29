import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { cn } from '@utils/helpers/cn';
import { getStatusColor } from '@utils/helpers';
import { router } from 'expo-router';
import { PAGE_ROUTES } from '@utils/constants';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { CalendarRemove02Icon } from '@hugeicons/core-free-icons';
import { useHomeOverview } from '../hooks';
import { isActiveOverviewLeave, formatHomeDate } from '../utils';
import type { HomeLeaveT } from '../types/home';

/**
 * Active leave card displayed in the "Active Applications" section.
 *
 * Shows the single `latest_leave` returned by the home overview endpoint when
 * it is still active (not rejected and end date today or later). Otherwise the
 * empty state is shown. Tapping the card opens the leave detail screen.
 */
export const HomeActiveLeaveCard = () => {
  const { data } = useHomeOverview();
  const latest = data?.latest_leave;
  const active = latest && isActiveOverviewLeave(latest) ? latest : null;

  const onPressLeave = (leave: HomeLeaveT) => {
    router.push(
      PAGE_ROUTES.LEAVE.DETAILS({
        leave_cd: leave.leave_cd,
        from_dt: leave.from_dt,
        order_dt: leave.order_dt,
      })
    );
  };

  if (!active) {
    return (
      <View className="flex-1 flex-col items-center justify-center gap-y-2 border border-border p-6">
        <HugeiconsIcon icon={CalendarRemove02Icon} className="text-graphite/60" size={48} />
        <Text className="text-center text-lg font-medium tracking-wider text-graphite">
          No active leaves at the moment.
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-3 rounded-md border border-border bg-white p-4">
      <TouchableOpacity onPress={() => onPressLeave(active)} className="flex-row justify-between">
        <View>
          <Text className="text-sm text-primary">{active.leave_desc}</Text>
          <Text className="font-semibold text-primary">{active.reason_for_leave}</Text>

          <View className="flex-1 flex-row gap-x-2">
            <Text className="mt-1 text-graphite">{formatHomeDate(active.from_dt)}</Text>
            <Text className="mt-1 text-graphite">-</Text>
            <Text className="mt-1 text-graphite">{formatHomeDate(active.to_dt)}</Text>
          </View>
        </View>

        <View
          className={cn(
            'items-center justify-center rounded-md px-3 py-1',
            getStatusColor(active.verify_flg_desc).bg
          )}>
          <Text className="text-base">{active.verify_flg_desc}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

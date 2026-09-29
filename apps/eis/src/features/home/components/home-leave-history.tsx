import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { PAGE_ROUTES } from '@utils/constants/routes';
import { getStatusColor } from '@utils/helpers';
import { Button } from '@components/ui';
import { useHomeOverview } from '../hooks';
import { isActiveOverviewLeave, formatHomeDate } from '../utils';
import type { HomeLeaveT } from '../types/home';

/**
 * Leave history preview shown in the "Recent History" section.
 *
 * Displays the single `latest_leave` returned by the home overview endpoint
 * when it is **not** active (rejected or already finished). Shows the empty
 * state when there is no leave, or when the latest leave is still active
 * (it is shown in the "Active Applications" card instead). Tapping the row
 * opens the leave detail screen.
 */
export const HomeLeaveHistory = () => {
  const { data } = useHomeOverview();
  const latest = data?.latest_leave;
  const history = latest && !isActiveOverviewLeave(latest) ? latest : null;

  const onPressLeave = (leave: HomeLeaveT) => {
    router.push(
      PAGE_ROUTES.LEAVE.DETAILS({
        leave_cd: leave.leave_cd,
        from_dt: leave.from_dt,
        order_dt: leave.order_dt,
      })
    );
  };

  if (!history) {
    return (
      <View className="flex-1 items-center justify-center gap-y-4 border border-border p-6">
        <Image
          source={require('../../../shared/assets/images/empty-list.jpg')}
          className="aspect-square h-64 object-cover object-center"
        />
        <Text className="text-center text-lg font-bold tracking-wider text-black">
          No leave history
        </Text>
        <Text className="text-center text-lg font-medium tracking-wider text-graphite">
          You {`haven't`} taken any leaves yet. When you do, they will appear here.
        </Text>
        <Button
          size={'lg'}
          variant={'primary'}
          className="font-bold tracking-widest"
          onPress={() => router.push(PAGE_ROUTES.LEAVE.CREATE)}>
          Apply for Your First Leave
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-between border-b border-border py-4">
      <TouchableOpacity onPress={() => onPressLeave(history)}>
        <Text className="text-sm text-primary">{history.leave_desc}</Text>
        <Text className="text-lg font-semibold">{history.reason_for_leave}</Text>

        <View className="flex-1 flex-row gap-x-2">
          <Text className="text-gray-500">{formatHomeDate(history.from_dt)}</Text>
          <Text className="text-gray-500">-</Text>
          <Text className="text-gray-500">{formatHomeDate(history.to_dt)}</Text>
        </View>
      </TouchableOpacity>

      <Text className={getStatusColor(history.verify_flg_desc).text}>
        {history.verify_flg_desc}
      </Text>
    </View>
  );
};

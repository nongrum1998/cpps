import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '@components/ui/card';
import { ILeaveDetails } from '../types';
import { LeaveTypeCode } from '@sharedTypes/leave';
import { LEAVE_ICONS } from '../utils/constants';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Calendar01Icon } from '@hugeicons/core-free-icons';

interface LeaveBalanceCardProps {
  item: ILeaveDetails;
}

export const LeaveBalanceCard = ({ item }: LeaveBalanceCardProps) => (
  <View className="mt-4">
    <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-graphite">
      Leave Balance
    </Text>
    <Card variant="bordered" className="p-5">
      <View className="flex-row items-center justify-between py-3">
        <View className="flex-row items-center gap-3">
          <View className="rounded-md bg-primary-soft p-2">
            <HugeiconsIcon
              icon={LEAVE_ICONS[item?.type as LeaveTypeCode] ?? Calendar01Icon}
              size={20}
              color="#024ad8"
            />
          </View>
          <View>
            <Text className="text-sm font-semibold text-foreground">{item.leave_desc}</Text>
            <Text className="text-xs text-muted-foreground">
              {item.closing_bal_as_on ? `Closing as of ${item.closing_bal_as_on}` : '-'}
            </Text>
          </View>
        </View>
        <Text className="text-lg font-bold text-foreground">{item.closing_bal}</Text>
      </View>
    </Card>
  </View>
);

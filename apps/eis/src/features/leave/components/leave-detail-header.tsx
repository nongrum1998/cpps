import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@utils/helpers/cn';
import { getStatusColor } from '@utils/helpers/get-status-color';
import { getStatusIcon } from '@utils/helpers/get-icon';
import { ILeaveDetails } from '../types';
import { LEAVE_ICONS } from '../utils/constants';
import { Card } from '@components/ui/card';
import { LeaveTypeCode } from '@sharedTypes/leave';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Calendar03Icon } from '@hugeicons/core-free-icons';

/**
 * Props accepted by the {@link LeaveDetailHeader} component.
 */
interface LeaveDetailHeaderProps {
  /** The full leave record to render the header for. */
  leave: ILeaveDetails;
}

/**
 * Displays the top section of the leave detail screen.
 *
 * Renders a card containing the leave-type icon (dynamically selected
 * via {@link LEAVE_ICONS} based on `leave.leave_cd`), the leave
 * description as the title, the duration in days, and a status badge
 * coloured by {@link getStatusColor} according to the verification
 * status (`leave.verify_flg_desc`).
 *
 * The status badge uses the icon returned by {@link getStatusIcon} and
 * the colour scheme returned by `getStatusColor` to provide a quick
 * visual indication of whether the leave is approved, pending, or
 * rejected.
 *
 * @example
 * ```tsx
 * <LeaveDetailHeader leave={leave} />
 * ```
 */
export const LeaveDetailHeader = ({ leave }: LeaveDetailHeaderProps) => {
  const statusStyle = getStatusColor(leave.verify_flg_desc);

  return (
    <View className="mt-4">
      <Card variant="bordered" className="p-6">
        <View className="mb-4 flex-row items-center justify-between">
          <View className={cn('rounded-lg p-2', statusStyle.bg)}>
            <HugeiconsIcon
              icon={LEAVE_ICONS[leave.leave_cd as LeaveTypeCode] ?? Calendar03Icon}
              size={32}
              className={cn(statusStyle.text)}
            />
          </View>
          <View
            className={cn('flex-row items-center gap-1.5 rounded-md px-3 py-1', statusStyle.bg)}>
            <HugeiconsIcon
              icon={getStatusIcon(leave.verify_flg_desc)}
              size={14}
              className={cn(statusStyle.text)}
            />
            <Text className={cn('text-xs font-semibold', statusStyle.text)}>
              {leave.verify_flg_desc}
            </Text>
          </View>
        </View>

        <Text className="mb-1 text-2xl font-semibold text-foreground">{leave.leave_desc}</Text>
        <Text className="text-sm text-muted-foreground">
          {leave.no_days} {parseInt(leave.no_days) === 1 ? 'day' : 'days'}
        </Text>
      </Card>
    </View>
  );
};

import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '@components/ui/card';
import { ILeaveDetails } from '../types';
import { HugeiconsIcon } from '@hugeicons/react-native';
import type { IconSvgElement } from '@hugeicons/react-native';
import {
  AlarmClockIcon,
  Calculator01Icon,
  Calendar01Icon,
  Calendar03Icon,
  ClipboardIcon,
} from '@hugeicons/core-free-icons';

/**
 * Props accepted by the {@link LeaveDetailInfo} component.
 */
interface LeaveDetailInfoProps {
  /** The full leave record whose detail fields to render. */
  leave: ILeaveDetails;
}

/**
 * Renders a single labelled row inside the leave details card.
 *
 * Each row consists of a {@link HugeiconsIcon} icon on the
 * left, a label (uppercase, subtle) above the value on the right.
 *
 * @param icon - Hugeicons glyph object to display.
 * @param label - Short label text (e.g. `From`, `To`, `Duration`).
 * @param value - The value text shown below the label.
 */
const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: IconSvgElement;
  label: string;
  value: string;
}) => (
  <View className="mb-4 flex-row items-start">
    <View className="mr-3 mt-0.5 w-6 items-center">
      <HugeiconsIcon icon={icon} size={20} color={'#636363'} />
    </View>
    <View className="flex-1">
      <Text className="mb-0.5 text-xs font-medium text-graphite">{label}</Text>
      <Text className="text-sm font-semibold text-foreground">{value}</Text>
    </View>
  </View>
);

export const LeaveDetailInfo = ({ leave }: LeaveDetailInfoProps) => (
  <Card variant="bordered" className="mt-4 p-5">
    <Text className="mb-4 text-xs font-bold uppercase tracking-wider text-graphite">
      Leave Details
    </Text>
    <InfoRow icon={Calendar01Icon} label="From" value={leave.from_dt} />
    <InfoRow icon={Calendar03Icon} label="To" value={leave.to_dt} />
    <InfoRow
      icon={Calculator01Icon}
      label="Duration"
      value={`${leave.no_days} ${parseInt(leave.no_days) === 1 ? 'day' : 'days'}`}
    />
    <InfoRow icon={ClipboardIcon} label="Leave Type" value={leave.leave_desc} />
    <InfoRow icon={AlarmClockIcon} label="Order Date" value={leave.order_dt} />
    {leave.reason_for_leave && (
      <View className="mt-2 rounded-md bg-secondary p-4">
        <Text className="mb-1.5 text-xs font-medium text-graphite">Reason</Text>
        <Text className="text-sm leading-5 text-charcoal">{leave.reason_for_leave}</Text>
      </View>
    )}
  </Card>
);

import React from 'react';
import { View, Text } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  BadgeCheckIcon,
  Calendar02Icon,
  IdentityCardIcon,
  LandmarkIcon,
  UserSquareIcon,
} from '@hugeicons/core-free-icons';
import type { NPSAnnux5 } from '../types';

type Props = {
  /** Raw NPS statement payload used for member identity fields. */
  data: NPSAnnux5;
};

/**
 * Member information card for the NPS statement screen.
 *
 * Renders icon + label/value rows (Name, PRAN, PPAN, DoJ, regularisation,
 * office, designation, department, DDO code) in a flex-wrap grid, mirroring
 * the GPF employee information card. Values fall back to '-' when empty.
 *
 * @param props - Component props.
 */
export function NPSMemberInfoCard({ data }: Props) {
  const rows = [
    { icon: UserSquareIcon, label: 'Name', value: data.fname },
    { icon: IdentityCardIcon, label: 'PRAN', value: data.pran },
    { icon: BadgeCheckIcon, label: 'PPAN', value: data.ppan },
    { icon: Calendar02Icon, label: 'Date of Joining', value: data.date_of_joining },
    { icon: Calendar02Icon, label: 'Date of Regularisation', value: data.date_of_regularisation },
    { icon: LandmarkIcon, label: 'Office', value: data.office_name },
    { icon: BadgeCheckIcon, label: 'Designation', value: data.desig },
    { icon: LandmarkIcon, label: 'Department', value: data.dept },
    { icon: BadgeCheckIcon, label: 'DDO Code', value: data.ddo_code },
  ];

  return (
    <View className="rounded-lg border border-border bg-card p-lg shadow-sm">
      <Text className="mb-4 text-display-xs text-ink">Member Information</Text>
      <View className="flex-row flex-wrap gap-y-5">
        {rows.map((row) => (
          <View key={row.label} className="w-full flex-row items-start gap-sm">
            <View className="bg-primary-fixed/30 mt-0.5 rounded-md p-2">
              <HugeiconsIcon icon={row.icon} size={20} color="#024ad8" />
            </View>
            <View className="flex-1 gap-y-1">
              <Text className="text-caption-md text-graphite">{row.label}</Text>
              <Text className="text-body-emphasis" numberOfLines={1}>
                {row.value || '-'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

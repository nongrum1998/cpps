import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@utils/helpers/cn';
import { useAuthStore } from '@stores/auth.store';
import { getStatusColor } from '@utils/helpers';

interface SummaryCardProps {
  label: string;
  amount: string;
  className?: string;
}

/**
 * Displays a salary summary card with amount, status color, pay level, and masked bank account.
 * Uses the authenticated user's pay scale and account info from auth store.
 */
export const SummaryCard = ({ label, amount, className }: SummaryCardProps) => {
  const { user } = useAuthStore();
  const statusStyle = getStatusColor('Pending');
  const bgClass = statusStyle.bg;

  const textClass = statusStyle.text;

  const borderClass = statusStyle.border;

  return (
    <View className={cn('mb-6 rounded-lg p-6', bgClass, className)}>
      <Text className={cn('mb-1 text-sm font-medium', textClass)}>{label}</Text>
      <Text className="mb-6 text-4xl font-bold text-white">{amount}</Text>

      <View className={cn('mb-4 h-[1px] w-full', borderClass)} />

      <View className="flex-row justify-between">
        <View>
          <Text className={cn('mb-1 text-xs', textClass)}>Pay Level</Text>
          <Text className="font-semibold text-white">{user?.pay_scale ?? '-'}</Text>
        </View>
        <View>
          <Text className={cn('mb-1 text-xs', textClass)}>Bank Account No.</Text>
          <Text className="font-semibold text-white">
            ********{user?.emp_bank_account_no?.slice(4) ?? '-'}
          </Text>
        </View>
      </View>
    </View>
  );
};

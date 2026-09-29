import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Card } from '@components/ui/card';
import { cn } from '@utils/helpers/cn';
import { EmployeeTaxSummary } from '../types';
import { getStatusColor } from '@utils/helpers';

export function TaxSummaryCard({
  item,
  onPress,
}: {
  item: EmployeeTaxSummary;
  onPress: () => void;
}) {
  const maskedPan =
    item.panNumber?.length >= 10 ? 'XXXX' + item.panNumber.slice(-4) : item.panNumber || '-';

  const statusLabels: Record<string, string> = {
    NOT_FILED: 'Not Filed',
    FILED: 'Filed',
    PROCESSED: 'Processed',
  };

  return (
    <TouchableOpacity onPress={onPress} className="mb-4">
      <Card variant="bordered" className="p-5">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-base font-bold text-foreground">{item.employeeName}</Text>
            <Text className="text-xs text-graphite">{item.designation}</Text>
          </View>
          <View className={cn('rounded-md px-3 py-1', getStatusColor(item.filingStatus).bg)}>
            <Text className="text-xs font-semibold">
              {statusLabels[item.filingStatus] || item.filingStatus}
            </Text>
          </View>
        </View>
        <View className="flex-row justify-between">
          <View>
            <Text className="text-xs font-medium uppercase text-graphite">PAN</Text>
            <Text className="text-sm font-medium text-charcoal">{maskedPan}</Text>
          </View>
          <View className="items-end">
            <Text className="text-xs font-medium uppercase text-graphite">Gross Income</Text>
            <Text className="text-sm font-bold text-foreground">
              Rs {item.grossAnnualIncome.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
        <View className="mt-2 flex-row justify-between">
          <View className="flex-row items-center gap-1">
            <View
              className={
                'h-2 w-2 rounded-md ' + (item.regime === 'NEW' ? 'bg-primary' : 'bg-amber-500')
              }
            />
            <Text className="text-xs text-graphite">
              {item.regime === 'NEW' ? 'New Regime' : 'Old Regime'}
            </Text>
          </View>
          <Text className="text-sm font-bold text-semantic-up">
            Tax: Rs {item.totalTax.toLocaleString('en-IN')}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

import React from 'react';
import { View, Text } from 'react-native';

type SummaryRow = {
  label: string;
  value: string;
};

type Props = {
  /** Label/value rows in display order (from buildSummaryRows). */
  rows: SummaryRow[];
};

/**
 * Vertical summary card for the NPS statement screen.
 *
 * Renders label/value rows with hairline separators. Returns null when empty.
 *
 * @param props - Component props.
 */
export const NPSSummaryCard = ({ rows }: Props) => {
  if (!rows || rows.length === 0) return null;

  return (
    <View className="rounded-lg border border-border bg-card p-lg shadow-sm">
      <Text className="mb-4 text-display-xs text-ink">Summary</Text>
      <View className="flex-col">
        {rows.map((row, index) => (
          <View
            key={row.label}
            className={`flex-row items-center justify-between py-md ${
              index < rows.length - 1 ? 'border-b border-border' : ''
            }`}>
            <Text className="text-caption-md text-graphite">{row.label}</Text>
            <Text className="text-body-emphasis text-ink">{row.value || '-'}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

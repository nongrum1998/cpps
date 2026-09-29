import React from 'react';
import { View, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import type { NPSMonthlyRow } from '../types';
import { NPS_MONTHLY_COLUMNS } from '../utils/constants';

type MonthlyRow = NPSMonthlyRow & { id: string };

type Props = {
  /** Zipped monthly rows to render. */
  data: MonthlyRow[];
};

/**
 * Horizontally scrollable NPS monthly contribution table.
 *
 * Mirrors the GPF monthly table: primary-colored header row, alternating row
 * backgrounds, and an emphasised Total column. Returns null when empty.
 *
 * @param props - Component props.
 */
export const NPSMonthlyTable = ({ data }: Props) => {
  if (!data || data.length === 0) return null;

  return (
    <View className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {/* Accent strip */}
      <View className="h-1 bg-primary" />

      {/* Title bar */}
      <View className="flex-row items-center justify-between px-md py-md">
        <View className="flex-row items-center gap-sm">
          <View className="h-4 w-0.5 rounded-full bg-primary" />
          <Text className="text-display-xs text-ink">NPS Monthly Contribution</Text>
        </View>
      </View>

      {/* Scrollable table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}>
        <View>
          {/* Header row */}
          <View className="flex-row bg-primary">
            {NPS_MONTHLY_COLUMNS.map((col) => (
              <View key={col.key} style={{ minWidth: col.minWidth }} className="px-sm py-md">
                <Text className="text-caption-sm font-semibold uppercase tracking-wider text-white">
                  {col.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Data rows */}
          {data.map((row, index) => (
            <View
              key={row.id}
              className={`flex-row border-t border-border ${
                index % 2 === 0 ? 'bg-surface' : 'bg-muted/20'
              }`}>
              {NPS_MONTHLY_COLUMNS.map((col) => {
                const value = row[col.key] ?? '-';
                return (
                  <View key={col.key} style={{ minWidth: col.minWidth }} className="px-sm py-md">
                    <Text
                      className={`text-caption-md ${
                        col.emphasis ? 'font-semibold text-primary' : 'font-medium text-ink'
                      }`}>
                      {value}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

import React from 'react';
import { View, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import type { GPFSummary } from '../types';
import { SUMMARY_COLUMNS } from '../utils/constants';

/**
 * Renders the GPF summary data in a horizontally scrollable table.
 *
 * Displays summary rows with alternating background colors using the
 * HP design system tokens. The header uses `bg-primary` with white
 * uppercase text. The Total column is visually emphasised with a
 * semibold weight and primary color. Includes a title bar with
 * a PDF download action.
 *
 * @param data - Array of GPFSummary objects to display.
 */
interface Summary extends GPFSummary {
  id: string;
}

export const SummaryVerticalView = ({ data }: { data: Summary[] }) => {
  if (!data || data.length === 0) return null;

  return (
    <View className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {/* ── Accent strip ── */}
      <View className="h-1 bg-primary" />

      {/* ── Title bar with PDF action ── */}
      <View className="flex-row items-center justify-between px-md py-md">
        <View className="flex-row items-center gap-sm">
          <View className="h-4 w-0.5 rounded-full bg-primary" />
          <Text className="text-display-xs text-ink">GPF Summary Details</Text>
        </View>
      </View>

      {/* ── Scrollable table ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}>
        <View>
          {/* Header row */}
          <View className="flex-row bg-primary">
            {SUMMARY_COLUMNS.map((col) => (
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
              {SUMMARY_COLUMNS.map((col) => {
                const value = row[col.key] || '-';
                return (
                  <View key={col.key} style={{ minWidth: col.minWidth }} className="px-sm py-md">
                    <Text
                      className={`text-caption-md ${col.emphasis ? 'font-semibold text-primary' : 'font-medium text-ink'}`}>
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

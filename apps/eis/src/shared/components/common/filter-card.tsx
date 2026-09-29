import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { cn } from '@utils/helpers/cn';
import { months as defaultMonths } from '@utils/helpers';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ChevronDownIcon, ChevronUpIcon, FilterVerticalIcon } from '@hugeicons/core-free-icons';

/** A selectable filter option with label and value. */
export interface FilterOption {
  label: string;
  value: string;
}

/** Props for the FilterCard collapsible filter component. */
export interface FilterCardProps {
  // Collapsible Props
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;

  // Status Filter
  status?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: FilterOption[];

  // Year Filter
  year?: string;
  onYearChange?: (value: string) => void;
  years?: string[];

  // Month Filter
  month?: string;
  onMonthChange?: (value: string) => void;
  months?: string[];

  className?: string;
}

type FilterChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
};

const FilterChip = ({ label, selected, onPress, disabled }: FilterChipProps) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.7}
    className={cn(
      'mr-3 rounded-md border px-4 py-1.5',
      selected ? 'border-primary bg-primary' : 'border-border'
    )}>
    <Text className={cn('text-sm font-bold', selected ? 'text-white' : 'text-charcoal')}>
      {label}
    </Text>
  </TouchableOpacity>
);

const SectionLabel = ({ title }: { title: string }) => (
  <Text className="mb-2 ml-1 text-xs font-bold uppercase tracking-wider text-graphite">
    {title}
  </Text>
);

/**
 * Renders a collapsible filter card with status, year, and month filter sections.
 * Supports controlled or uncontrolled open state via isOpen/onToggle.
 * Each filter section renders horizontal chip selectors.
 * Returns null if no filter sections have options configured.
 */
export const FilterCard = ({
  isOpen: externalIsOpen,
  onToggle,
  status,
  onStatusChange,
  statusOptions,
  year,
  onYearChange,
  years,
  month,
  onMonthChange,
  months = defaultMonths,
  className,
}: FilterCardProps) => {
  // Internal state for when external state is not provided
  const [internalIsOpen, setInternalIsOpen] = useState(externalIsOpen ?? false);

  // Sync internal state if external state changes
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setInternalIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  const handleToggle = () => {
    const newState = !internalIsOpen;
    if (externalIsOpen === undefined) {
      setInternalIsOpen(newState);
    }
    onToggle?.(newState);
  };

  const showContent = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const hasStatus = status !== undefined && statusOptions && statusOptions.length > 0;
  const hasYears = year !== undefined && years && years.length > 0;
  const hasMonths = month !== undefined && months && months.length > 0;

  if (!hasStatus && !hasYears && !hasMonths) {
    return null;
  }

  const sortedYears = years?.sort((a, b) => {
    if (a === year) return -1;
    if (b === year) return 1;
    return 0;
  });

  const sortedMonth = months?.sort((a, b) => {
    if (a === month) return -1;
    if (b === month) return 1;
    return 0;
  });

  return (
    <View className={cn('rounded-md border border-border p-2', className)}>
      {/* Header / Toggle Button */}
      <TouchableOpacity
        onPress={handleToggle}
        className="flex-row items-center justify-between rounded-md p-4 ">
        <View className="flex-row items-center gap-2">
          <HugeiconsIcon icon={FilterVerticalIcon} size={20} className="text-primary" />
          <Text className="text-lg font-bold text-primary">Filters</Text>
        </View>
        <HugeiconsIcon
          icon={showContent ? ChevronUpIcon : ChevronDownIcon}
          size={20}
          className="text-primary"
        />
      </TouchableOpacity>

      {/* Collapsible Content */}
      {showContent && (
        <View className="px-4 pb-4 pt-2">
          {/* Status Section */}
          {hasStatus && (
            <View className="mb-4">
              <SectionLabel title="Status" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {statusOptions?.map((option) => (
                  <FilterChip
                    key={option.value}
                    label={option.label}
                    selected={status === option.value}
                    onPress={() => onStatusChange?.(option.value)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Year Section */}
          {hasYears && (
            <View className={cn(hasStatus && 'mt-2', hasMonths ? 'mb-4' : '')}>
              <SectionLabel title="Year" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {sortedYears?.map((y) => (
                  <FilterChip
                    key={y}
                    label={y}
                    selected={year === y}
                    onPress={() => onYearChange?.(y)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Month Section */}
          {hasMonths && (
            <View className={cn((hasStatus || hasYears) && 'mt-2')}>
              <SectionLabel title="Month" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {sortedMonth?.map((m) => (
                  <FilterChip
                    key={m}
                    label={m}
                    selected={month === m}
                    onPress={() => onMonthChange?.(m)}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

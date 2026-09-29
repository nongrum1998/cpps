import { TouchableOpacity, View, Text } from 'react-native';
import { TabRouteT } from '@sharedTypes/tab';
import { cn } from '@utils/helpers/cn';
import { HugeiconsIcon } from '@hugeicons/react-native';
import React from 'react';
import { getTabIcons } from '@utils/helpers/get-icon';

export const CustomTabBar = ({
  state,
  descriptors,
  navigation,
  insets,
  tabConfig,
}: any & { tabConfig: TabRouteT[] }) => {
  return (
    <View
      className="flex-row items-center justify-around border-t border-border/40 bg-background px-3 pt-2"
      style={{ paddingBottom: Math.max(insets.bottom + 4, 12) }}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const config = tabConfig.find((t: TabRouteT) => t.name === route.name);
        const label =
          (options.tabBarLabel as string) || options.title || config?.title || route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const icon = getTabIcons(route.name);

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            testID={`TAB_${route.name.toUpperCase().replace('INDEX', 'HOME')}`}
            className={cn(
              'flex-1 items-center justify-center  rounded-xl px-2 py-1.5 transition-all',
              isFocused ? 'bg-primary' : 'bg-transparent'
            )}>
            <HugeiconsIcon
              focusable={false}
              className={cn(isFocused ? 'text-primary-foreground' : 'text-graphite')}
              icon={icon}
              size={20}
            />
            <Text
              numberOfLines={1}
              className={cn(
                'mt-1 text-center text-xs font-medium',
                isFocused ? 'font-bold text-primary-foreground' : 'text-graphite'
              )}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

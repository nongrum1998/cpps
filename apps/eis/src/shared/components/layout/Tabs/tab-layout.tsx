import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@stores/auth.store';
import { CustomTabBar } from './custom-tab-bar';
import { COMMON_TABS } from '@config/tabs';
import { StackHeader } from '../stack-header';

export const TabLayout = () => {
  const { role } = useAuthStore();
  const insets = useSafeAreaInsets();

  const tabConfig = COMMON_TABS;

  return (
    <View className="flex-1 bg-background dark:bg-gray-900">
      <StackHeader />
      <Tabs
        key={role}
        tabBar={(props) => <CustomTabBar {...props} insets={insets} tabConfig={tabConfig} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: 'transparent' },
        }}>
        {tabConfig.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
            }}
          />
        ))}
      </Tabs>
    </View>
  );
};

TabLayout.displayName = 'TabLayout';

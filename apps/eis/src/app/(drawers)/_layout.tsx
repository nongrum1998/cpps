import { CustomDrawerContent } from '@components/layout/custom-drawer-content';
import { Drawer } from 'expo-router/drawer';

export default function Layout() {
  return <Drawer drawerContent={CustomDrawerContent} screenOptions={{ headerShown: false }} />;
}

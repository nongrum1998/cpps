import { EmployeeTypeT } from '@sharedTypes/auth';
import { Route } from 'expo-router';

type MenuItemsT = {
  id?: number;
  title: string;
  href: Route;
};

const fotterMenuItems: MenuItemsT[] = [{ title: 'Settings', href: '/settings' as Route }];

const commonMenuItems: MenuItemsT[] = [
  { title: 'Home', href: '/' as Route },
  { title: 'Announcements', href: '/announcements' as Route },
  { title: 'E-Pay Slip', href: '/e-pay-slip' as Route },
  { title: 'Loan Management', href: '/loans' as Route },
  // { title: 'Income Tax', href: '/tax' as Route, icon: 'cash-outline' },
];

const dbMenuItems: MenuItemsT[] = [
  ...commonMenuItems,
  { title: 'GPF Statements', href: '/gpf-statements' as Route },
  // ...fotterMenuItems,
];

const dcMenuItems: MenuItemsT[] = [
  ...commonMenuItems,
  { title: 'NPS Statements', href: '/nps-statements' as Route },
  // ...fotterMenuItems,
];

const defaultMenuItems: MenuItemsT[] = [...commonMenuItems, ...fotterMenuItems];

export function getDrawerItems(type?: EmployeeTypeT) {
  switch (type) {
    case 'DC':
      return dcMenuItems;
    case 'DB':
      return dbMenuItems;
    default:
      return defaultMenuItems;
  }
}

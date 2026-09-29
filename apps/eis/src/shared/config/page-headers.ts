import type { ReactNode } from 'react';

export interface PageHeaderConfig {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showDrawer?: boolean;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  bottomContent?: ReactNode;
  background?: string;
}

export const PAGE_HEADERS = {
  // TABS
  '/': { title: 'MeghEIS', showDrawer: true },
  '/statement': { title: 'Salary Statement', showDrawer: true },
  '/leaves': { title: 'My Leaves', showDrawer: true },
  '/pension': { title: 'Pensions', showDrawer: true },
  '/profile': { title: 'My Profile', showDrawer: true },

  // pages
  '/settings': { title: 'Settings', showBackButton: true },
  '/announcements': { title: 'Announcement Board', showBackButton: true },
  '/auth': { title: 'GovtAuth Meghalaya' },
  '/auth/sign-up': { title: 'Sign Up', showBackButton: true },
  '/auth/forgot-password': { title: 'Forgot Password', showBackButton: true, showDrawer: false },
  '/dev/ui-lab': { title: 'UI Laboratory', showBackButton: true },
  '/leaves/[id]': { title: 'My Leaves', showBackButton: true },
  '/leaves/create': { title: 'Apply for Leaves', showBackButton: true },
  '/ui-lab': { title: 'Ui Lab', showBackButton: true },
  '/tax': { title: 'Income Tax', showBackButton: true },
  '/tax/detail': { title: 'Tax Computation', showBackButton: true },
  '/tax/edit': { title: 'Edit Tax Details', showBackButton: true },
  '/tax/create': { title: 'New Tax Record', showBackButton: true },
  '/loans': { title: 'My Loans', showBackButton: true },
  '/loans/[loanId]': { title: 'Loan Details', showBackButton: true },
  '/gpf-statements': { title: 'GPF Statements', showBackButton: true },
  '/e-pay-slip': { title: 'E-Pay Slip', showBackButton: true },
  '/e-pay-slip/[paySlipNo]': { title: 'E-Pay Slip Details', showBackButton: true },
  '/nps-statements': { title: 'NPS Statements', showBackButton: true },
  '/pdf-preview': { title: 'Preview PDF', showBackButton: true, showDrawer: false },
} as const satisfies Record<string, PageHeaderConfig>;

export type PageHeaderRoute = keyof typeof PAGE_HEADERS;

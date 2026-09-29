import { LeaveTypeCode } from '@sharedTypes/leave';
import type { IconSvgElement } from '@hugeicons/react-native';
import {
  Building01Icon,
  HandPointingLeft01Icon,
  HeartIcon,
  Home01Icon,
  Medicine01Icon,
  Shield01Icon,
  Sun01Icon,
  Time01Icon,
  UmbrellaIcon,
  WomanIcon,
} from '@hugeicons/core-free-icons';

export const LEAVE_TYPES: Record<LeaveTypeCode, LeaveTypeCode> = {
  COM: 'COM',
  LND: 'LND',
  EOL: 'EOL',
  LPA: 'LPA',
  EL: 'EL',
  HPL: 'HPL',
  ML: 'ML',
  SL: 'SL',
  WPL: 'WPL',
  PL: 'PL',
};

/**
 * Maps every recognised {@link LeaveTypeCode} to a matching Hugeicons
 * glyph so leave cards and headers show a distinct visual per type.
 *
 * Falls back to `Calendar01Icon` when the type is unknown (e.g. during
 * loading or a new server-side type not yet in the union).
 */
export const LEAVE_ICONS: Record<LeaveTypeCode, IconSvgElement> = {
  /** Compensatory Off */
  COM: HeartIcon,
  /** Leave Not Due */
  LND: Building01Icon,
  /** Extra Ordinary Leave */
  EOL: Sun01Icon,
  /** Leave Preparatory to Retirement */
  LPA: HandPointingLeft01Icon,
  /** Earned Leave */
  EL: UmbrellaIcon,
  /** Half Pay Leave */
  HPL: Time01Icon,
  /** Maternity Leave */
  ML: WomanIcon,
  /** Sick Leave */
  SL: Medicine01Icon,
  /** Work Place Leave */
  WPL: Home01Icon,
  /** Personal / Privilege Leave */
  PL: Shield01Icon,
};

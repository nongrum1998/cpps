import {
  Home09Icon,
  HugeiconsIcon,
  Payment01Icon,
  UserSquareIcon,
  NotificationSquareIcon,
  DocumentAttachmentIcon,
  GoogleDocIcon,
  Settings01Icon,
  CalendarAdd01Icon,
  CheckmarkCircle02Icon,
  PaymentSuccess01Icon,
  Clock01Icon,
  Time04Icon,
  Alert02Icon,
  CancelCircleIcon,
  HelpCircleIcon,
  MoneyBag02Icon,
  Home01FreeIcons,
  PaymentFreeIcons,
  CalendarAdd01FreeIcons,
  UserSquareFreeIcons,
} from '@hugeicons/core-free-icons';

export const getTabIcons = (path: string, isActive?: boolean): typeof HugeiconsIcon => {
  switch (path) {
    case 'index':
      return isActive ? Home01FreeIcons : Home09Icon;
    case 'statement/index':
      return isActive ? PaymentFreeIcons : Payment01Icon;
    case 'leaves/index':
      return isActive ? CalendarAdd01FreeIcons : CalendarAdd01Icon;
    case 'profile/index':
      return isActive ? UserSquareFreeIcons : UserSquareIcon;
    default:
      return Home09Icon;
  }
};

export const getDrawerIcons = (path: string): typeof HugeiconsIcon => {
  switch (path) {
    case 'index':
      return Home09Icon;
    case '/settings':
      return Settings01Icon;
    case '/announcements':
      return NotificationSquareIcon;
    case '/gpf-statements':
      return DocumentAttachmentIcon;
    case '/e-pay-slip':
      return DocumentAttachmentIcon;
    case '/loans':
      return MoneyBag02Icon;
    case '/nps-statements':
      return GoogleDocIcon;
    default:
      return Home09Icon;
  }
};

export const getStatusIcon = (status: string): typeof HugeiconsIcon => {
  switch (status) {
    // Leave: Verified
    case 'Verified':
      return CheckmarkCircle02Icon;

    // Salary: Paid / Processed
    case 'PAID':
    case 'PROCESSED':
    case 'APPROVED':
      return PaymentSuccess01Icon;

    // Leave: Pending / Entry (draft)
    case 'Pending':
    case 'Entry':
      return Clock01Icon;

    // Salary: Pending / Held
    case 'PENDING':
    case 'HELD':
      return Time04Icon;

    // Tax: Not Filed
    case 'NOT_FILED':
      return Alert02Icon;

    // Tax: Filed
    case 'FILED':
      return GoogleDocIcon;

    // Leave: Rejected
    case 'Rejected':
    case 'REJECTED':
    case 'FAILED':
      return CancelCircleIcon;

    default:
      return HelpCircleIcon;
  }
};

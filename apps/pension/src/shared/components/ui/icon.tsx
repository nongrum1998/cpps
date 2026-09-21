import { ColorValue } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  AlertIcon,
  AlertTriangle,
  ArrowLeft01FreeIcons,
  Book01Icon,
  Camera01Icon,
  CheckmarkCircle01Icon,
  CheckmarkCircle02Icon,
  ChevronDownIcon,
  Contact01Icon,
  DashboardSquare01Icon,
  EllipseIcon,
  EyeClosedIcon,
  EyeIcon,
  InfoIcon,
  Mail01Icon,
  MapPinIcon,
  MenuIcon,
  PrinterIcon,
  Shield01Icon,
  SmartPhone01Icon,
  TelephoneIcon,
  Tick01Icon,
  UserCircle02Icon,
  UserUnlock01Icon,
  Rocket01Icon,
  FileNotFoundIcon,
  SecurityBlockIcon,
  ToolsIcon,
  PropertyDeleteIcon,
  ReceiptTextIcon,
  Download01Icon,
  FileCheckIcon,
} from './icons';
import { cn } from '@utils/helpers';

export type IconName =
  | 'eye-open'
  | 'eye-close'
  | 'user-unlock'
  | 'arrow-left'
  | 'menu'
  | 'info'
  | 'information-circle'
  | 'camera-01'
  | 'user-01'
  | 'alert-triangle'
  | 'contact-01'
  | 'alert-circle'
  | 'book-01'
  | 'shield'
  | 'check-circle'
  | 'check-circle-2'
  | 'circle'
  | 'check'
  | 'chevron-down'
  | 'map-pin'
  | 'phone'
  | 'printer'
  | 'mail'
  | 'rocket-01'
  | 'security-block'
  | 'tool'
  | 'smartphone'
  | 'property-delete'
  | 'receipt'
  | 'file-not-found'
  | 'file-check-02'
  | 'download-01';

type Props = {
  name: IconName;
  size?: number;
  color?: ColorValue;
  className?: string;
};

const getHugeIcon = (name: IconName) => {
  switch (name) {
    case 'eye-open':
      return EyeIcon;
    case 'eye-close':
      return EyeClosedIcon;
    case 'user-unlock':
      return UserUnlock01Icon;
    case 'arrow-left':
      return ArrowLeft01FreeIcons;
    case 'info':
      return InfoIcon;
    case 'menu':
      return MenuIcon;
    case 'alert-circle':
      return AlertIcon;
    case 'alert-triangle':
      return AlertTriangle;
    case 'information-circle':
      return DashboardSquare01Icon;
    case 'camera-01':
      return Camera01Icon;
    case 'user-01':
      return UserCircle02Icon;
    case 'contact-01':
      return Contact01Icon;
    case 'book-01':
      return Book01Icon;
    case 'shield':
      return Shield01Icon;
    case 'check-circle':
      return CheckmarkCircle01Icon;
    case 'check-circle-2':
      return CheckmarkCircle02Icon;
    case 'circle':
      return EllipseIcon;
    case 'check':
      return Tick01Icon;
    case 'chevron-down':
      return ChevronDownIcon;
    case 'map-pin':
      return MapPinIcon;
    case 'phone':
      return TelephoneIcon;
    case 'printer':
      return PrinterIcon;
    case 'mail':
      return Mail01Icon;
    case 'smartphone':
      return SmartPhone01Icon;
    case 'rocket-01':
      return Rocket01Icon;
    case 'file-not-found':
      return FileNotFoundIcon;
    case 'security-block':
      return SecurityBlockIcon;
    case 'tool':
      return ToolsIcon;
    case 'property-delete':
      return PropertyDeleteIcon;
    case 'receipt':
      return ReceiptTextIcon;
    case 'download-01':
      return Download01Icon;
    case 'file-check-02':
      return FileCheckIcon;
    default:
      return MenuIcon;
  }
};

export const Icon = ({ name, size, className, color }: Props) => {
  return (
    <HugeiconsIcon
      color={color}
      icon={getHugeIcon(name)}
      size={size || 24}
      className={cn('', className)}
    />
  );
};

import {
  BarChart3,
  Boxes,
  Compass,
  Folder,
  HelpCircle,
  Landmark,
  Layers,
  Package,
  Receipt,
  Settings,
  Users,
  Wallet,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

export function CategoryIcon({ name, className = 'w-5 h-5' }: CategoryIconProps) {
  switch (name) {
    case 'Compass':
      return <Compass className={className} aria-hidden="true" />;
    case 'Settings':
      return <Settings className={className} aria-hidden="true" />;
    case 'Package':
      return <Package className={className} aria-hidden="true" />;
    case 'Boxes':
      return <Boxes className={className} aria-hidden="true" />;
    case 'Wallet':
      return <Wallet className={className} aria-hidden="true" />;
    case 'Landmark':
      return <Landmark className={className} aria-hidden="true" />;
    case 'Receipt':
      return <Receipt className={className} aria-hidden="true" />;
    case 'Users':
      return <Users className={className} aria-hidden="true" />;
    case 'BarChart3':
      return <BarChart3 className={className} aria-hidden="true" />;
    case 'Layers':
      return <Layers className={className} aria-hidden="true" />;
    case 'HelpCircle':
      return <HelpCircle className={className} aria-hidden="true" />;
    default:
      return <Folder className={className} aria-hidden="true" />;
  }
}

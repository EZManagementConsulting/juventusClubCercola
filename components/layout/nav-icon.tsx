import {
  BarChart3,
  History,
  IdCard,
  KeyRound,
  Layers,
  LayoutDashboard,
  MapPin,
  Settings,
  ShieldCheck,
  Store,
  Tag,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  ShieldCheck,
  KeyRound,
  IdCard,
  UserCog,
  MapPin,
  Layers,
  Store,
  Tag,
  History,
  BarChart3,
  Settings,
};

export function NavIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? LayoutDashboard;
  return <Icon className={className} aria-hidden />;
}

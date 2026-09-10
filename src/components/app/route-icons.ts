import {
  Bookmark,
  Compass,
  FileText,
  LayoutDashboard,
  Medal,
  Settings,
  Trophy,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import type { RouteKey } from "@/lib/routing/routes";

export const ROUTE_ICONS: Partial<Record<RouteKey, LucideIcon>> = {
  dashboard: LayoutDashboard,
  opportunities: Compass,
  applications: FileText,
  saved: Bookmark,
  record: Medal,
  leaderboard: Trophy,
  profile: UserRound,
  settings: Settings,
};

export function routeIcon(key: RouteKey): LucideIcon {
  return ROUTE_ICONS[key] ?? Compass;
}

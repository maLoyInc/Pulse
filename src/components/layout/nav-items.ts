import { ChartColumnIncreasing, LayoutDashboard, Settings, Table2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Admin-only destinations are disabled (not hidden) for viewers. */
  adminOnly?: boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    href: "/",
    label: "Overview",
    description: "Headline metrics and this week's signal",
    icon: LayoutDashboard,
  },
  {
    href: "/analytics",
    label: "Analytics",
    description: "Trends, category mix and traffic split",
    icon: ChartColumnIncreasing,
  },
  {
    href: "/data",
    label: "Data",
    description: "Every transaction, filterable and exportable",
    icon: Table2,
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Workspace preferences",
    icon: Settings,
    adminOnly: true,
  },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

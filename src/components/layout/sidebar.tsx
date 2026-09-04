"use client";

import { Activity, Lock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActivePath } from "./nav-items";
import { useRole } from "@/providers/role-provider";
import { cn } from "@/lib/utils";

export function BrandMark({ withTagline = false }: { withTagline?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-fg">
        <Activity className="size-4.5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold tracking-tight text-fg">
          Pulse
        </span>
        {withTagline ? (
          <span className="block truncate text-[11px] text-fg-subtle">
            See your business metrics in real time
          </span>
        ) : null}
      </span>
    </div>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { canManageSettings } = useRole();

  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActivePath(pathname, item.href);
        const locked = item.adminOnly && !canManageSettings;
        const Icon = item.icon;

        if (locked) {
          return (
            <span
              key={item.href}
              aria-disabled="true"
              title="Viewers cannot open Settings"
              className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-fg-subtle opacity-60"
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className="flex-1">{item.label}</span>
              <Lock className="size-3.5 shrink-0" aria-hidden />
              <span className="sr-only">(admin only)</span>
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent-soft text-accent-strong"
                : "text-fg-muted hover:bg-surface-2 hover:text-fg",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent transition-opacity",
                active ? "opacity-100" : "opacity-0",
              )}
            />
            <Icon className="size-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Persistent rail on desktop; the mobile drawer renders `SidebarNav` itself. */
export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col justify-between border-r border-line bg-surface px-3 py-4 lg:flex">
      <div>
        <div className="px-1.5 pb-5">
          <BrandMark withTagline />
        </div>
        <SidebarNav />
      </div>
      <p className="px-2.5 text-[11px] leading-relaxed text-fg-subtle">
        Demo workspace running on generated data — no backend, no live account.
      </p>
    </aside>
  );
}

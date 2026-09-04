"use client";

import { FlaskConical, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "./sidebar";
import { RoleSwitcher } from "./role-switcher";
import { ThemeToggle } from "./theme-toggle";

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMenu}
        aria-label="Open navigation"
      >
        <Menu className="size-5" aria-hidden />
      </Button>

      <div className="lg:hidden">
        <BrandMark />
      </div>

      <span
        className="hidden items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-fg-muted lg:inline-flex"
        title="All numbers on this dashboard are generated mock data"
      >
        <FlaskConical className="size-3.5" aria-hidden />
        Demo data
      </span>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <RoleSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}

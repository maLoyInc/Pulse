"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { BrandMark, Sidebar, SidebarNav } from "./sidebar";
import { Topbar } from "./topbar";

/** Slide-in navigation for tablet and phone widths. */
function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        tabIndex={-1}
        className="absolute inset-y-0 left-0 flex w-64 max-w-[85vw] flex-col gap-5 border-r border-line bg-surface px-3 py-4"
      >
        <div className="flex items-center justify-between gap-2 px-1.5">
          <BrandMark />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>
        <SidebarNav onNavigate={onClose} />
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMenu={() => setNavOpen(true)} />
        <main
          id="main-content"
          className="mx-auto w-full max-w-[96rem] flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8"
        >
          {children}
        </main>
      </div>
      <MobileNav open={navOpen} onClose={() => setNavOpen(false)} />
    </div>
  );
}

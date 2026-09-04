"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";

/**
 * Light/dark switch. The icon renders as a neutral placeholder until hydration,
 * because the resolved theme is only known in the browser — swapping it after
 * hydration is what avoids both a mismatch warning and a wrong-icon flash.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHydrated();

  const isDark = mounted && resolvedTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={() => setTheme(nextTheme)}
      aria-label={
        mounted ? `Switch to ${nextTheme} mode` : "Toggle colour theme"
      }
      title={mounted ? `Switch to ${nextTheme} mode` : undefined}
    >
      {isDark ? (
        <Sun className="size-4" aria-hidden />
      ) : (
        <Moon className="size-4" aria-hidden />
      )}
    </Button>
  );
}

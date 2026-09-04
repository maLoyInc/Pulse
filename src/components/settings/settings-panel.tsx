"use client";

import { Lock } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Segmented } from "@/components/ui/segmented";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatDateLong } from "@/lib/date";
import { formatNumber } from "@/lib/format";
import {
  DATA_END_ISO,
  DATA_START_ISO,
  TIMESERIES_DAYS,
  transactions,
} from "@/lib/mock-data";
import type { Role } from "@/lib/types";
import { ROLE_LABEL, useRole } from "@/providers/role-provider";

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "admin", label: ROLE_LABEL.admin },
  { value: "viewer", label: ROLE_LABEL.viewer },
];

/**
 * Settings holds only preferences that genuinely do something: the theme and the
 * simulated role. A demo page full of switches wired to nothing is worse than a
 * short one.
 */
export function SettingsPanel() {
  const { role, setRole, canManageSettings } = useRole();

  if (!canManageSettings) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            icon={Lock}
            title="Settings are admin only"
            description="You are viewing Pulse as a Viewer. Switch the role in the top bar to Admin to change preferences."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <ThemeCard />

      <Card>
        <CardHeader>
          <div className="min-w-0">
            <CardTitle>Role simulation</CardTitle>
            <CardDescription>
              Client-side only — there is no login or backend in this demo. A
              Viewer keeps every chart and table but loses CSV export and this
              page.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          <Segmented
            label="Role"
            options={ROLE_OPTIONS}
            value={role}
            onChange={setRole}
          />
        </CardContent>
      </Card>

      <DatasetCard />
    </div>
  );
}

function ThemeCard() {
  const { theme, setTheme } = useTheme();
  const hydrated = useHydrated();
  // The stored theme is unknown on the server, so "System" holds the slot until
  // hydration rather than guessing and flipping.
  const value = hydrated ? (theme ?? "system") : "system";

  return (
    <Card>
      <CardHeader>
        <div className="min-w-0">
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Light and dark are two separate palettes, not one inverted — both are
            contrast-checked, charts included. Saved in this browser.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <Segmented
          label="Colour theme"
          options={THEME_OPTIONS}
          value={value}
          onChange={setTheme}
        />
      </CardContent>
    </Card>
  );
}

function DatasetCard() {
  const facts = [
    { label: "Time series", value: `${TIMESERIES_DAYS} days` },
    {
      label: "Covering",
      value: `${formatDateLong(DATA_START_ISO)} – ${formatDateLong(DATA_END_ISO)}`,
    },
    { label: "Transactions", value: formatNumber(transactions.length) },
    { label: "Source", value: "Generated in-app, fixed seed" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="min-w-0">
          <CardTitle>Demo dataset</CardTitle>
          <CardDescription>
            Pulse is a portfolio demo. Nothing here talks to a server — the
            numbers come from a seeded generator, so they are the same on every
            load.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {facts.map((fact) => (
            <div key={fact.label} className="min-w-0">
              <dt className="text-xs text-fg-subtle">{fact.label}</dt>
              <dd className="text-sm font-medium text-fg">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

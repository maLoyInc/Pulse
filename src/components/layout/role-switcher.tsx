"use client";

import { Segmented } from "@/components/ui/segmented";
import { useRole } from "@/providers/role-provider";
import type { Role } from "@/lib/types";

const ROLE_OPTIONS = [
  { value: "admin" as Role, label: "Admin" },
  { value: "viewer" as Role, label: "Viewer" },
];

/**
 * Simulated role switch — there is no auth here. Flipping to Viewer takes away
 * export and Settings immediately, with no reload, so the read-only path is
 * visible in the demo.
 */
export function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <Segmented
      label="Viewing as role"
      options={ROLE_OPTIONS}
      value={role}
      onChange={setRole}
    />
  );
}

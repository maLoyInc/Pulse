"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Role } from "@/lib/types";

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
  /** Viewers get a read-only dashboard: no export, no settings. */
  canExport: boolean;
  canManageSettings: boolean;
}

const RoleContext = createContext<RoleContextValue | null>(null);

/**
 * Client-side role simulation only — there is no auth in this demo. It exists
 * to show how a read-only view differs from an admin one.
 */
export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("admin");

  const value = useMemo<RoleContextValue>(
    () => ({
      role,
      setRole,
      canExport: role === "admin",
      canManageSettings: role === "admin",
    }),
    [role],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside <RoleProvider>");
  return ctx;
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  viewer: "Viewer",
};

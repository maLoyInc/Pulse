import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsPanel } from "@/components/settings/settings-panel";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Theme, simulated role and details of the demo dataset behind Pulse.",
};

export default function SettingsPage() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Settings"
        description="Preferences for this browser, and what the demo data is made of."
      />
      <SettingsPanel />
    </div>
  );
}

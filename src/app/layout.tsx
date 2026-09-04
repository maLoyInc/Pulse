import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { FilterProvider } from "@/providers/filter-provider";
import { RoleProvider } from "@/providers/role-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Pulse — SaaS analytics dashboard",
    template: "%s · Pulse",
  },
  description:
    "See your business metrics in real time. Pulse is a demo B2B analytics dashboard built with Next.js, Tailwind CSS and Recharts.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f17" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ThemeProvider>
          <RoleProvider>
            <FilterProvider>
              <ToastProvider>
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-fg"
                >
                  Skip to content
                </a>
                <AppShell>{children}</AppShell>
              </ToastProvider>
            </FilterProvider>
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

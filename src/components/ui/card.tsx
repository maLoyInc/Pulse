import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface shadow-sm shadow-black/[0.02]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      className={cn("text-sm font-semibold tracking-tight text-fg", className)}
      {...props}
    >
      {children}
    </h2>
  );
}

export function CardDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<"p">) {
  return (
    <p className={cn("mt-1 text-xs text-fg-muted", className)} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("px-4 py-4 sm:px-5 sm:py-5", className)} {...props} />
  );
}

/** Header + optional actions, the shape every chart and table card shares. */
export function CardToolbar({ children }: { children: ReactNode }) {
  return <div className="flex shrink-0 items-center gap-2">{children}</div>;
}

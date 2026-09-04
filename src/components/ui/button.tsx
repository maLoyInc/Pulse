import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-fg hover:bg-accent-hover disabled:hover:bg-accent",
  secondary:
    "border border-line bg-surface text-fg hover:bg-surface-2 disabled:hover:bg-surface",
  ghost: "text-fg-muted hover:bg-surface-2 hover:text-fg",
  danger: "border border-line bg-surface text-neg-strong hover:bg-neg-soft",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-2.5 text-xs",
  md: "h-9 gap-2 px-3.5 text-sm",
  icon: "size-9",
};

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  className,
  variant = "secondary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg font-medium whitespace-nowrap transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}

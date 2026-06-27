import type { HTMLAttributes } from "react";
import { cn } from "./utils";

type BadgeVariant = "blue" | "red" | "grey";

const variantClasses: Record<BadgeVariant, string> = {
  blue: "border-bc-royal-blue/25 bg-bc-royal-blue/10 text-bc-royal-blue",
  red: "border-bc-red/25 bg-bc-red/10 text-bc-red",
  grey: "border-bc-mid-grey bg-bc-light-grey text-bc-dark-grey",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  children,
  className,
  variant = "blue",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

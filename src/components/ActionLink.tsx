import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "./utils";

type ActionLinkVariant = "primary" | "secondary" | "ghost";
type ActionLinkSize = "sm" | "md";

const variantClasses: Record<ActionLinkVariant, string> = {
  primary:
    "border border-bc-royal-blue bg-bc-royal-blue text-bc-white hover:border-bc-navy hover:bg-bc-navy focus-visible:ring-bc-royal-blue",
  secondary:
    "border border-bc-mid-grey bg-bc-white text-bc-navy hover:border-bc-royal-blue hover:bg-bc-light-grey focus-visible:ring-bc-royal-blue",
  ghost:
    "border border-transparent bg-transparent text-bc-navy hover:border-bc-mid-grey hover:bg-bc-light-grey focus-visible:ring-bc-royal-blue",
};

const sizeClasses: Record<ActionLinkSize, string> = {
  sm: "h-8 px-2.5 text-xs",
  md: "h-9 px-3 text-sm",
};

export type ActionLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    children: ReactNode;
    size?: ActionLinkSize;
    variant?: ActionLinkVariant;
  };

export function ActionLink({
  children,
  className,
  size = "md",
  variant = "primary",
  ...props
}: ActionLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      <span>{children}</span>
    </Link>
  );
}

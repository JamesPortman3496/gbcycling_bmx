import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import {
  controlBaseClass,
  controlSizeClasses,
  controlVariantClasses,
  type ControlSize,
  type ControlVariant,
} from "./controlStyles";
import { cn } from "./utils";

export type ActionLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    children: ReactNode;
    size?: ControlSize;
    variant?: ControlVariant;
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
        controlBaseClass,
        controlSizeClasses[size],
        controlVariantClasses[variant],
        className,
      )}
      {...props}
    >
      <span>{children}</span>
    </Link>
  );
}

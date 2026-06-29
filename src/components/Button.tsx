import type { ButtonHTMLAttributes } from "react";
import {
  controlBaseClass,
  controlSizeClasses,
  controlVariantClasses,
  type ControlSize,
  type ControlVariant,
} from "./controlStyles";
import { cn } from "./utils";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: ControlSize;
  variant?: ControlVariant;
};

export function Button({
  children,
  className,
  disabled,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        controlBaseClass,
        controlSizeClasses[size],
        controlVariantClasses[variant],
        "disabled:pointer-events-none disabled:border-bc-mid-grey disabled:bg-bc-light-grey disabled:text-bc-dark-grey disabled:opacity-100",
        className,
      )}
      disabled={disabled}
      type={type}
      {...props}
    >
      <span>{children}</span>
    </button>
  );
}

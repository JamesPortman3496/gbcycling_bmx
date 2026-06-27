import type { ButtonHTMLAttributes } from "react";
import { cn } from "./utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-bc-royal-blue bg-bc-royal-blue text-bc-white hover:border-bc-navy hover:bg-bc-navy focus-visible:ring-bc-royal-blue",
  secondary:
    "border border-bc-mid-grey bg-bc-white text-bc-navy hover:border-bc-royal-blue hover:bg-bc-light-grey focus-visible:ring-bc-royal-blue",
  ghost:
    "border border-transparent bg-transparent text-bc-navy hover:border-bc-mid-grey hover:bg-bc-light-grey focus-visible:ring-bc-royal-blue",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-2.5 text-xs",
  md: "h-9 px-3 text-sm",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
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
        "inline-flex items-center justify-center gap-1.5 rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        sizeClasses[size],
        variantClasses[variant],
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

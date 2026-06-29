export type ControlVariant = "primary" | "secondary" | "ghost";
export type ControlSize = "sm" | "md";

export const controlBaseClass =
  "inline-flex items-center justify-center gap-1.5 rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

export const controlVariantClasses = {
  primary:
    "border border-bc-royal-blue bg-bc-royal-blue text-bc-white hover:border-bc-navy hover:bg-bc-navy focus-visible:ring-bc-royal-blue",
  secondary:
    "border border-bc-mid-grey bg-bc-white text-bc-navy hover:border-bc-royal-blue hover:bg-bc-light-grey focus-visible:ring-bc-royal-blue",
  ghost:
    "border border-transparent bg-transparent text-bc-navy hover:border-bc-mid-grey hover:bg-bc-light-grey focus-visible:ring-bc-royal-blue",
} satisfies Record<ControlVariant, string>;

export const controlSizeClasses = {
  sm: "h-8 px-2.5 text-xs",
  md: "h-9 px-3 text-sm",
} satisfies Record<ControlSize, string>;

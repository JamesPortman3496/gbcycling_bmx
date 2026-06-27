import type { HTMLAttributes } from "react";
import { cn } from "./utils";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-sm border border-bc-mid-grey bg-bc-white p-3",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

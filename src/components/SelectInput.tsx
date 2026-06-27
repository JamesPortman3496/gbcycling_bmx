import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { cn } from "./utils";

export type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  hint?: string;
  label?: string;
};

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  function SelectInput({ children, className, hint, id, label, ...props }, ref) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <label className="block space-y-2" htmlFor={inputId}>
        {label ? (
          <span className="text-sm font-semibold text-bc-navy">{label}</span>
        ) : null}
        <select
          className={cn(
            "h-11 w-full rounded-sm border border-bc-mid-grey bg-bc-white px-3 text-sm text-bc-navy transition-colors outline-none focus:border-bc-royal-blue focus:ring-2 focus:ring-bc-royal-blue/20",
            className,
          )}
          id={inputId}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {hint ? <p className="text-xs text-bc-dark-grey">{hint}</p> : null}
      </label>
    );
  },
);

SelectInput.displayName = "SelectInput";

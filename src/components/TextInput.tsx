import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "./utils";

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  hint?: string;
  label?: string;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput({ className, hint, id, label, ...props }, ref) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <label className="block space-y-2" htmlFor={inputId}>
        {label ? (
          <span className="text-sm font-semibold text-bc-navy">{label}</span>
        ) : null}
        <input
          className={cn(
            "h-11 w-full rounded-sm border border-bc-mid-grey bg-bc-white px-3 text-sm text-bc-navy transition-colors outline-none placeholder:text-bc-dark-grey/60 focus:border-bc-royal-blue focus:ring-2 focus:ring-bc-royal-blue/20",
            className,
          )}
          id={inputId}
          ref={ref}
          {...props}
        />
        {hint ? <p className="text-xs text-bc-dark-grey">{hint}</p> : null}
      </label>
    );
  },
);

TextInput.displayName = "TextInput";

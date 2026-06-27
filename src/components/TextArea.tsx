import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cn } from "./utils";

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hint?: string;
  label?: string;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea({ className, hint, id, label, ...props }, ref) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <label className="block space-y-2" htmlFor={inputId}>
        {label ? (
          <span className="text-sm font-semibold text-bc-navy">{label}</span>
        ) : null}
        <textarea
          className={cn(
            "min-h-28 w-full rounded-sm border border-bc-mid-grey bg-bc-white px-3 py-3 text-sm text-bc-navy transition-colors outline-none placeholder:text-bc-dark-grey/60 focus:border-bc-royal-blue focus:ring-2 focus:ring-bc-royal-blue/20",
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

TextArea.displayName = "TextArea";

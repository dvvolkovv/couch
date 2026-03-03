import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-body-sm font-medium text-neutral-900"
          >
            {label}
            {props.required && (
              <span className="ml-0.5 text-error-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            "flex h-10 w-full rounded-md border bg-white px-3 py-2 text-body-md text-neutral-950 transition-colors",
            "placeholder:text-neutral-500",
            "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200",
            "disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500",
            error
              ? "border-error-500 focus:border-error-500 focus:ring-error-100"
              : "border-neutral-400",
            className
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : hint
                ? `${inputId}-hint`
                : undefined
          }
          {...props}
        />
        {hint && !error && (
          <p
            id={`${inputId}-hint`}
            className="mt-1 text-caption text-neutral-600"
          >
            {hint}
          </p>
        )}
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-caption text-error-600"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };

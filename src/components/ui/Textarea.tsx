"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, icon, id, className = "", ...props }, ref) => {
    return (
      <div className="form-group">
        {label && (
          <label className="form-label" htmlFor={id}>
            {icon && <span className="form-label-icon">{icon}</span>}
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={`form-input ${error ? "form-input-error" : ""} ${className}`}
          rows={3}
          {...props}
        />
        {error && <p className="form-error">{error}</p>}
        {hint && !error && <p className="form-hint">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;

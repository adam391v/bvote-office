"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, id, className = "", ...props }, ref) => {
    return (
      <div className="form-group">
        {label && (
          <label className="form-label" htmlFor={id}>
            {icon && <span className="form-label-icon">{icon}</span>}
            {label}
          </label>
        )}
        <div className="form-input-wrapper">
          <input
            ref={ref}
            id={id}
            className={`form-input ${error ? "form-input-error" : ""} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        {hint && !error && <p className="form-hint">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;

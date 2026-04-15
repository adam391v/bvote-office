"use client";

import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";

interface DatePickerProps {
  label?: string;
  error?: string;
  hint?: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  id?: string;
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
  showMonthYearPicker?: boolean;
  disabled?: boolean;
}

export default function DatePicker({
  label,
  error,
  hint,
  selected,
  onChange,
  placeholder = "Chọn ngày...",
  id,
  minDate,
  maxDate,
  dateFormat = "dd/MM/yyyy",
  showMonthYearPicker = false,
  disabled = false,
}: DatePickerProps) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={id}>
          <span className="form-label-icon">
            <Calendar size={14} />
          </span>
          {label}
        </label>
      )}
      <div className="datepicker-wrapper">
        <ReactDatePicker
          id={id}
          selected={selected}
          onChange={onChange}
          placeholderText={placeholder}
          dateFormat={dateFormat}
          minDate={minDate}
          maxDate={maxDate}
          showMonthYearPicker={showMonthYearPicker}
          disabled={disabled}
          className={`form-input ${error ? "form-input-error" : ""}`}
          calendarClassName="bvote-calendar"
          wrapperClassName="datepicker-full-width"
          popperClassName="bvote-datepicker-popper"
          autoComplete="off"
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      {hint && !error && <p className="form-hint">{hint}</p>}
    </div>
  );
}

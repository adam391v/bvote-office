"use client";

import ReactSelect, { type Props as ReactSelectProps, type StylesConfig, type GroupBase } from "react-select";

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  id?: string;
  options: SelectOption[];
  value?: SelectOption | null;
  defaultValue?: SelectOption | null;
  onChange?: (option: SelectOption | null) => void;
  placeholder?: string;
  isSearchable?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  isMulti?: false;
  name?: string;
  menuPortalTarget?: HTMLElement | null;
}

const customStyles: StylesConfig<SelectOption, false, GroupBase<SelectOption>> = {
  control: (base, state) => ({
    ...base,
    background: "var(--bg-input)",
    borderColor: state.isFocused ? "var(--primary)" : "var(--border-color)",
    borderRadius: "var(--radius-sm)",
    padding: "0.125rem 0",
    fontSize: "0.875rem",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: "var(--border-light)",
    },
    minHeight: 40,
  }),
  menu: (base) => ({
    ...base,
    background: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-sm)",
    boxShadow: "var(--shadow-lg)",
    zIndex: 50,
    overflow: "hidden",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected
      ? "var(--primary)"
      : state.isFocused
      ? "var(--bg-card-hover)"
      : "transparent",
    color: state.isSelected ? "var(--color-primary)" : "var(--text-primary)",
    fontSize: "0.875rem",
    padding: "0.625rem 0.875rem",
    cursor: "pointer",
    "&:active": {
      background: "var(--primary-dark)",
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: "var(--text-primary)",
  }),
  placeholder: (base) => ({
    ...base,
    color: "var(--text-muted)",
  }),
  input: (base) => ({
    ...base,
    color: "var(--text-primary)",
  }),
  indicatorSeparator: (base) => ({
    ...base,
    background: "var(--border-color)",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "var(--text-muted)",
    "&:hover": {
      color: "var(--text-secondary)",
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "var(--text-muted)",
    "&:hover": {
      color: "var(--danger)",
    },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: "var(--text-muted)",
    fontSize: "0.875rem",
  }),
};

export default function Select({
  label,
  error,
  hint,
  icon,
  id,
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "Chọn...",
  isSearchable = true,
  isClearable = false,
  isDisabled = false,
  name,
  menuPortalTarget,
}: SelectProps) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={id}>
          {icon && <span className="form-label-icon">{icon}</span>}
          {label}
        </label>
      )}
      <ReactSelect<SelectOption, false>
        instanceId={id}
        inputId={id}
        name={name}
        options={options}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        placeholder={placeholder}
        isSearchable={isSearchable}
        isClearable={isClearable}
        isDisabled={isDisabled}
        styles={customStyles}
        noOptionsMessage={() => "Không có kết quả"}
        menuPortalTarget={menuPortalTarget}
      />
      {error && <p className="form-error">{error}</p>}
      {hint && !error && <p className="form-hint">{hint}</p>}
    </div>
  );
}

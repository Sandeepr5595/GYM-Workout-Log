import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string; // Added placeholder prop
}

const Select: React.FC<SelectProps> = ({ 
  label, 
  id, 
  error, 
  options, 
  placeholder, // Destructured placeholder
  className = '', 
  ...props // Remaining HTMLSelectAttributes, includes `value`, `onChange` etc.
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-brand-text-muted mb-1">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`block w-full pl-3 pr-10 py-2 bg-brand-surface border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-brand-text ${className}`}
        {...props} // Spread value, onChange, required, etc.
      >
        {/* If placeholder is provided, render it as the first, disabled option.
            It will be displayed if props.value is "" or undefined.
            If props.required is true, browser validation will handle it if this option remains selected.
        */}
        {placeholder && (
          <option value="" disabled> 
            {placeholder}
          </option>
        )}
        {options.map((optionEl) => ( // Renamed 'option' to 'optionEl'
          <option key={optionEl.value} value={optionEl.value}>
            {optionEl.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Select;
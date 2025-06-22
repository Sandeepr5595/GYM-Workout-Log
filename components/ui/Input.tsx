
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, id, error, icon, className = '', ...props }) => {
  const hasIcon = !!icon;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-brand-text-muted mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {hasIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-text-muted">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`block w-full ${hasIcon ? 'pl-10' : 'px-3'} py-2 bg-brand-surface border border-brand-border rounded-md shadow-sm placeholder-brand-text-muted focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-brand-text ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
    
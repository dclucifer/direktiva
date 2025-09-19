import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: React.ReactNode;
  className?: string;
}

const Select: React.FC<SelectProps> = ({ label, id, children, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>}
      <select
        id={id}
        className={`w-full px-3 py-2 bg-component-background border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-basetext ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

export default Select;

import React from 'react';

interface ToggleProps {
  enabled: boolean;
  onChange: () => void;
  srText: string;
}

const Toggle: React.FC<ToggleProps> = ({ enabled, onChange, srText }) => {
  return (
    <button
      type="button"
      className={`${
        enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
    >
      <span className="sr-only">{srText}</span>
      <span
        aria-hidden="true"
        className={`${
          enabled ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
};

export default Toggle;

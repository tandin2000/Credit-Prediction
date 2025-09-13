import React, { useState } from 'react';

interface FieldProps {
  label: string;
  name: string;
  type: 'text' | 'number';
  value: string | number;
  onChange: (name: string, value: string | number) => void;
  placeholder?: string;
  required?: boolean;
  description?: string;
  example?: string;
}

export const Field: React.FC<FieldProps> = ({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  description,
  example,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="mb-4">
      <div className="flex items-center mb-1">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {description && (
          <div className="relative ml-2">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </button>
            
            {showTooltip && (
              <div className="absolute z-10 w-64 p-3 mt-1 text-sm text-white bg-gray-900 rounded-lg shadow-lg -ml-32">
                <div className="mb-2">
                  <strong>Description:</strong> {description}
                </div>
                {example && (
                  <div>
                    <strong>Example:</strong> {example}
                  </div>
                )}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            )}
          </div>
        )}
      </div>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(name, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        required={required}
      />
    </div>
  );
};

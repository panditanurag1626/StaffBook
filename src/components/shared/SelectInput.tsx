import React from 'react';

interface SelectInputProps {
  id: string;
  label: string;
  options: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  selectClassName?: string;
  disabled?: boolean;
  placeholder?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  className = '',
  selectClassName = '',
  disabled = false,
  placeholder = 'Select',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={id} className="block font-semibold text-base text-[#18192B] mb-1">
        {/* {label} */}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary text-base font-medium text-gray-800 max-h-56 overflow-y-auto ${selectClassName}`}
        style={{
          // Use global CSS variables for colors if available
          backgroundColor: 'var(--color-bg-secondary, #f8fafc)',
          color: 'var(--color-text-primary, #18192B)',
        }}
        size={1} // Ensures it's a dropdown, not a listbox
      >
        <option value="" className="text-gray-400">{placeholder}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {/* 
        Note: 
        - The max-h-56 and overflow-y-auto classes ensure the dropdown does not exceed a certain height and is scrollable if there are many options.
        - Styling of the dropdown list itself (the "options" popup) is browser-controlled and cannot be fully customized with CSS in a cross-browser way.
        - For full custom dropdown UI, consider using a headless UI library or custom component.
      */}
    </div>
  );
};

export default SelectInput; 
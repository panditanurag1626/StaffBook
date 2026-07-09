'use client';
import React from 'react';
import { THEME } from '../../styles/theme';

interface TextInputProps {
  id: string;
  label: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  helperText?: string;
  className?: string;
  inputClassName?: string;
  rightIcon?: React.ReactNode;
}

const TextInput: React.FC<TextInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  maxLength,
  helperText,
  className = '',
  inputClassName = '',
  rightIcon,
}) => {
  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={id} className={`block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 ml-1`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          maxLength={maxLength}
          placeholder={placeholder}
          className={`w-full px-4 py-3 text-gray-900 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-300 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 text-sm font-semibold placeholder:text-gray-400 placeholder:font-normal transition-all duration-300 ${rightIcon ? 'pr-12' : ''} ${inputClassName}`}
        />
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightIcon}
          </div>
        )}
      </div>
      {helperText && <p className={`text-xs text-gray-500 mt-1 ml-1 font-medium`}>{helperText}</p>}
    </div>
  );
};

export default TextInput; 
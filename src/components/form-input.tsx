'use client';

import React from 'react';

interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

export function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled = false,
  required = false,
  min,
  max,
  step,
}: FormInputProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        min={min}
        max={max}
        step={step}
        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}

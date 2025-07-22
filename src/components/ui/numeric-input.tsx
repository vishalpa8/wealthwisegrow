'use client';

import React, { useState, useEffect, forwardRef } from 'react';
import { parseRobustNumber } from '@/lib/utils/number';
import { useCurrency } from '@/contexts/currency-context';

interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'min' | 'max'> {
  // Allow undefined/null value (empty input)
  value: number | string | null | undefined;
  onValueChange: (value: number | null) => void;
  // Add more specific props
  allowNegative?: boolean;
  allowZero?: boolean;
  decimalPlaces?: number;
  min?: number | undefined;
  max?: number | undefined;
  formatOptions?: Intl.NumberFormatOptions;
  hideControls?: boolean; // Hide the increment/decrement arrows
  showCurrencySymbol?: boolean;
  placeholder?: string;
  label?: string;
  helpText?: string;
  errorText?: string;
  isValid?: boolean;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  helpTextClassName?: string;
  errorClassName?: string;
}

export const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      value,
      onValueChange,
      allowNegative = false,
      allowZero = true,
      decimalPlaces = 2,
      min,
      max,
      formatOptions,
      hideControls = false,
      showCurrencySymbol = false,
      placeholder,
      label,
      helpText,
      errorText,
      isValid = true,
      className = '',
      inputClassName = '',
      labelClassName = '',
      helpTextClassName = '',
      errorClassName = '',
      ...props
    },
    ref
  ) => {
    // Track internal input state for better UX
    const [inputValue, setInputValue] = useState<string>('');
    const { currency } = useCurrency();

    // Initialize input from props
    useEffect(() => {
      if (value === null || value === undefined || value === '') {
        setInputValue('');
      } else if (typeof value === 'string') {
        setInputValue(value);
      } else if (typeof value === 'number') {
        // Format number to string with appropriate decimal places
        const formatter = new Intl.NumberFormat(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: decimalPlaces,
          useGrouping: false, // No thousand separators in the input
          ...formatOptions
        });
        setInputValue(formatter.format(value));
      }
    }, [value, decimalPlaces, formatOptions]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      
      // Always update the internal input value for a smooth UX
      setInputValue(newValue);
      
      // If input is empty, call onValueChange with null or 0 based on allowZero
      if (!newValue.trim()) {
        onValueChange(allowZero ? 0 : null);
        return;
      }
      
      // Allow the minus sign by itself to support typing negative numbers
      if (allowNegative && newValue === '-') {
        // Don't convert to number yet, wait for more input
        return;
      }
      
      // Parse the input as a number
      const parsedValue = parseRobustNumber(newValue);
      
      // Apply validation rules
      if (!allowNegative && parsedValue < 0) {
        // For negative values in non-negative inputs, convert to positive
        if (parsedValue !== 0) {
          const positiveValue = Math.abs(parsedValue);
          setInputValue(positiveValue.toString());
          onValueChange(positiveValue);
          return;
        }
        return; // Don't allow negative values if not enabled
      }
      
      if (!allowZero && parsedValue === 0) {
        // If zero isn't allowed but was entered, we don't update the parent
        // but we allow the user to continue typing
        return;
      }
      
      let finalValue = parsedValue;
      
      // Apply min/max constraints if specified
      if (min !== undefined && parsedValue < min) {
        // We still update the input field but leave validation to the parent
        // Optionally, we could clamp the value: finalValue = Math.max(parsedValue, min);
      }
      
      if (max !== undefined && parsedValue > max) {
        // We still update the input field but leave validation to the parent
        // Optionally, we could clamp the value: finalValue = Math.min(parsedValue, max);
      }
      
      // Notify parent of the new value
      onValueChange(finalValue);
    };

    // Handle blur to format the value
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (props.onBlur) {
        props.onBlur(e);
      }
      
      // If the input is empty, keep it empty or set to 0 based on allowZero
      if (!inputValue.trim()) {
        if (allowZero) {
          setInputValue('0');
          onValueChange(0);
        }
        return;
      }
      
      let parsedValue = parseRobustNumber(inputValue);
      
      // Apply constraints on blur for better UX
      if (!allowNegative && parsedValue < 0) {
        parsedValue = Math.abs(parsedValue);
      }
      
      if (!allowZero && parsedValue === 0 && min !== undefined) {
        parsedValue = min;
      }
      
      // Apply min/max on blur
      if (min !== undefined && parsedValue < min) {
        parsedValue = min;
        onValueChange(parsedValue);
      }
      
      if (max !== undefined && parsedValue > max) {
        parsedValue = max;
        onValueChange(parsedValue);
      }
      
      // Format the parsed value for display
      const formatter = new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimalPlaces,
        useGrouping: false, // No thousand separators in the input
        ...formatOptions
      });
      
      setInputValue(formatter.format(parsedValue));
      
      // Ensure the parent gets the correctly parsed and constrained value
      onValueChange(parsedValue);
    };

    return (
      <div className={`form-group ${className}`}>
        {label && (
          <label className={`form-label ${labelClassName}`}>
            {label}
            {showCurrencySymbol && (
              <span className="ml-1">({currency.symbol})</span>
            )}
          </label>
        )}
        
        <div className="relative">
          {showCurrencySymbol && (
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {currency.symbol}
            </span>
          )}
          
          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-input ${showCurrencySymbol ? 'pl-7' : ''} ${
              !isValid ? 'border-red-500' : ''
            } ${inputClassName}`}
            placeholder={placeholder}
            {...props}
            // Override step and type props to control decimal behavior
            step={typeof props.step === 'number' ? props.step : 'any'}
          />
        </div>
        
        {helpText && (
          <p className={`form-help ${helpTextClassName}`}>{helpText}</p>
        )}
        
        {errorText && !isValid && (
          <p className={`text-red-500 text-xs mt-1 ${errorClassName}`}>
            {errorText}
          </p>
        )}
      </div>
    );
  }
);

NumericInput.displayName = 'NumericInput';

export default NumericInput;

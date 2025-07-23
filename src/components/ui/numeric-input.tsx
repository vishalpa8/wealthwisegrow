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
      allowNegative = true,
      allowZero = true,
      decimalPlaces = 2,
      // hideControls = false,
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
        });
        setInputValue(formatter.format(value));
      }
    }, [value, decimalPlaces]);

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
      
      // Ultra-flexible validation - accept all values for maximum user-friendliness
      // Let parseRobustNumber handle all edge cases gracefully
      // Remove strict validation rules to allow users to input any value
      
      const finalValue = parsedValue;
      
      // Remove min/max constraints for maximum flexibility
      // Let the parent component handle any validation if needed
      
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
      
      const parsedValue = parseRobustNumber(inputValue);
      
      // Ultra-flexible approach - no constraints on blur
      // Accept any value the user enters for maximum user-friendliness
      // Let the parent component and calculation functions handle edge cases
      
      // Format the parsed value for display
      const formatter = new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimalPlaces,
        useGrouping: false, // No thousand separators in the input
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

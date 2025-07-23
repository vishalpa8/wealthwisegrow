import React from 'react';

/**
 * Reusable Calculator Utilities
 * Provides common validation, field configurations, and helper functions
 * for all calculators to ensure consistency and user-friendliness
 */

import { parseRobustNumber } from './number';
import type { EnhancedCalculatorField } from '@/components/ui/enhanced-calculator-form';

/**
 * Graceful input validation that never throws errors
 */
export const validateInputs = {
  /**
   * Validates and sanitizes a positive number (converts negative to positive)
   */
  positiveNumber: (value: any, defaultValue: number = 0): number => {
    const parsed = parseRobustNumber(value);
    return Math.abs(parsed) || defaultValue;
  },

  /**
   * Validates and sanitizes a signed number (allows negative values)
   */
  signedNumber: (value: any, defaultValue: number = 0): number => {
    const parsed = parseRobustNumber(value);
    return isFinite(parsed) ? parsed : defaultValue;
  },

  /**
   * Validates and sanitizes a percentage (0-100)
   */
  percentage: (value: any, defaultValue: number = 0): number => {
    const parsed = parseRobustNumber(value);
    return Math.min(Math.max(Math.abs(parsed) || defaultValue, 0), 100);
  },

  /**
   * Validates and sanitizes years (minimum 1)
   */
  years: (value: any, defaultValue: number = 1): number => {
    const parsed = parseRobustNumber(value);
    return Math.max(Math.abs(parsed) || defaultValue, 1);
  },

  /**
   * Validates and sanitizes age (1-120)
   */
  age: (value: any, defaultValue: number = 25): number => {
    const parsed = parseRobustNumber(value);
    return Math.min(Math.max(Math.abs(parsed) || defaultValue, 1), 120);
  },

  /**
   * Validates and sanitizes interest rate (0-50%)
   */
  interestRate: (value: any, defaultValue: number = 0): number => {
    const parsed = parseRobustNumber(value);
    return Math.min(Math.max(Math.abs(parsed) || defaultValue, 0), 50);
  }
};

/**
 * Common field configurations for reusability
 */
export const createFieldConfigs = (currencySymbol: string) => ({
  /**
   * Standard amount field
   */
  amount: (name: string, label: string, placeholder: string, tooltip?: string): EnhancedCalculatorField => ({
    label,
    name,
    type: 'number',
    placeholder,
    unit: currencySymbol,
    min: 0,
    tooltip: tooltip || `${label} amount`
  }),

  /**
   * Standard percentage field
   */
  percentage: (name: string, label: string, placeholder: string, tooltip?: string): EnhancedCalculatorField => ({
    label,
    name,
    type: 'percentage',
    placeholder,
    min: 0,
    max: 100,
    step: 0.1,
    tooltip: tooltip || `${label} percentage`
  }),

  /**
   * Standard years field
   */
  years: (name: string, label: string, placeholder: string, tooltip?: string): EnhancedCalculatorField => ({
    label,
    name,
    type: 'number',
    placeholder,
    unit: 'years',
    min: 0,
    tooltip: tooltip || `${label} in years`
  }),

  /**
   * Standard age field
   */
  age: (name: string, label: string, placeholder: string, tooltip?: string): EnhancedCalculatorField => ({
    label,
    name,
    type: 'number',
    placeholder,
    unit: 'years',
    min: 1,
    max: 120,
    tooltip: tooltip || `${label} in years`
  }),

  /**
   * Standard select field
   */
  select: (name: string, label: string, options: Array<{value: string | number, label: string}>, tooltip?: string): EnhancedCalculatorField => ({
    label,
    name,
    type: 'select',
    options,
    tooltip: tooltip || `Select ${label.toLowerCase()}`
  })
});

/**
 * Standard calculation error handler
 */
export const handleCalculationError = (error: any, calculatorName: string): string => {
  console.error(`${calculatorName} calculation error:`, error);
  return error.message || 'Calculation failed. Please check your inputs.';
};

/**
 * Standard calculation wrapper that handles errors gracefully
 */
export function safeCalculation<T>(
  calculationFn: () => T,
  fallbackValue: T,
  calculatorName: string,
  setError: (error: string | undefined) => void
): T {
  try {
    setError(undefined);
    return calculationFn();
  } catch (error: any) {
    const errorMessage = handleCalculationError(error, calculatorName);
    setError(errorMessage);
    return fallbackValue;
  }
}

/**
 * Standard loading handler
 */
export const createLoadingHandler = (setLoading: (loading: boolean) => void) => {
  return () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };
};

/**
 * Standard input change handler
 */
export const createInputChangeHandler = (
  setValues: (updater: (prev: any) => any) => void,
  setError?: (error: string | undefined) => void
) => {
  return (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (setError) {
      setError(undefined);
    }
  };
};

/**
 * Common validation patterns for different calculator types
 */
export const validationPatterns = {
  /**
   * Loan calculator validation
   */
  loan: (values: any) => ({
    principal: validateInputs.positiveNumber(values.principal),
    rate: validateInputs.interestRate(values.rate),
    years: validateInputs.years(values.years),
    extraPayment: validateInputs.positiveNumber(values.extraPayment)
  }),

  /**
   * Investment calculator validation
   */
  investment: (values: any) => ({
    initialAmount: validateInputs.positiveNumber(values.initialAmount),
    monthlyContribution: validateInputs.positiveNumber(values.monthlyContribution),
    annualReturn: validateInputs.percentage(values.annualReturn),
    years: validateInputs.years(values.years)
  }),

  /**
   * Tax calculator validation
   */
  tax: (values: any) => ({
    income: validateInputs.positiveNumber(values.income),
    deductions: validateInputs.positiveNumber(values.deductions),
    age: validateInputs.age(values.age)
  }),

  /**
   * Savings calculator validation
   */
  savings: (values: any) => ({
    principal: validateInputs.positiveNumber(values.principal),
    rate: validateInputs.interestRate(values.rate),
    years: validateInputs.years(values.years),
    monthlyContribution: validateInputs.positiveNumber(values.monthlyContribution)
  })
};

/**
 * Common result formatters
 */
export const formatResults = {
  /**
   * Standard currency result
   */
  currency: (label: string, value: number, tooltip?: string, highlight?: boolean) => ({
    label,
    value,
    type: 'currency' as const,
    highlight,
    tooltip
  }),

  /**
   * Standard percentage result
   */
  percentage: (label: string, value: number, tooltip?: string) => ({
    label,
    value,
    type: 'percentage' as const,
    tooltip
  }),

  /**
   * Standard number result
   */
  number: (label: string, value: number, tooltip?: string) => ({
    label,
    value,
    type: 'number' as const,
    tooltip
  })
};

/**
 * Common sidebar tips for different calculator types
 */
export const sidebarTips = {
  loan: [
    'Compare rates from multiple lenders',
    'Consider prepayment options to save interest',
    'Check for processing fees and hidden charges',
    'Maintain a good credit score for better rates'
  ],
  
  investment: [
    'Start investing early to leverage compounding',
    'Regular contributions can significantly boost returns',
    'Diversify your portfolio to manage risk',
    'Review and rebalance periodically'
  ],
  
  tax: [
    'Keep all tax-related documents organized',
    'Consider tax-saving investments',
    'Plan your taxes at the beginning of the year',
    'Consult a tax advisor for complex situations'
  ],
  
  savings: [
    'Set clear financial goals',
    'Automate your savings',
    'Emergency fund should be 6-12 months of expenses',
    'Consider inflation while planning'
  ]
};

/**
 * Create standard sidebar with tips
 */
export const createSidebar = (tips: string[], calculatorName: string) => (
  <div className="space-y-4">
    <div className="card">
      <h3 className="text-base font-semibold text-neutral-900 mb-4">{calculatorName} Tips</h3>
      <div className="space-y-2">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);
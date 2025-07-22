/**
 * Robust Number Utilities for Calculator Applications
 * Handles all edge cases: zero, null, undefined, NaN, empty strings, and large numbers
 */

// Constants for number validation
export const MAX_SAFE_CALCULATION_VALUE = 1e15; // 1 quadrillion (supports trillions)
export const MIN_SAFE_CALCULATION_VALUE = -1e15;
export const PRECISION_DECIMAL_PLACES = 10;

/**
 * Robust number parser that handles all possible edge cases
 * Converting any input to a valid number, defaulting invalid or empty inputs to 0
 */
export function parseRobustNumber(value: any): number {
  // Handle null, undefined, empty string, or falsy values
  if (value === null || value === undefined || value === '' || value === false) {
    return 0;
  }

  // Handle boolean true
  if (value === true) {
    return 1;
  }

  // If already a number
  if (typeof value === 'number') {
    // Handle NaN, Infinity, -Infinity, and very small numbers that might be calculation artifacts
    if (!isFinite(value) || isNaN(value) || Math.abs(value) < 1e-10) {
      return 0;
    }
    return value;
  }

  // Handle string inputs with extensive cleaning
  if (typeof value === 'string') {
    // Skip parsing completely if the string is empty or whitespace only
    const trimmed = value.trim();
    if (trimmed === '' || trimmed === '-') {
      return 0;
    }

    // Handle common textual representations
    const lowerValue = trimmed.toLowerCase();
    if (['nan', 'null', 'undefined', 'none', 'nil', 'empty'].includes(lowerValue)) {
      return 0;
    }

    // Remove all currency symbols, commas, spaces, and non-numeric characters
    const cleanedValue = trimmed
      .replace(/[₹$€£¥₩₽₴₸₺₼₾₿฿₫₭₮₱₲₳₴₵₶₷₸₹₺₻₼₽₾₿]/g, '') // Currency symbols
      .replace(/[,\s'\u00A0]/g, '') // Commas, spaces, apostrophes, non-breaking spaces
      .replace(/[^\d.-]/g, '') // Keep only digits, dots, and minus signs
      .trim();

    // Handle empty string after cleaning or lone minus sign
    if (cleanedValue === '' || cleanedValue === '-' || cleanedValue === '.') {
      return 0;
    }

    // Handle multiple decimal points (take the first one)
    if (cleanedValue.split('.').length > 2) {
      const parts = cleanedValue.split('.');
      const newValue = parts[0] + '.' + parts.slice(1).join('');
      return parseFloat(newValue) || 0;
    }

    // Parse the cleaned string
    const parsed = parseFloat(cleanedValue);
    
    // Handle NaN result or other parsing issues
    if (isNaN(parsed) || !isFinite(parsed)) {
      return 0;
    }

    return parsed;
  }

  // Handle arrays (take first element if exists)
  if (Array.isArray(value)) {
    return value.length > 0 ? parseRobustNumber(value[0]) : 0;
  }

  // Handle objects (try to extract a numeric property)
  if (typeof value === 'object') {
    try {
      // Try common numeric properties
      const numericProps = ['value', 'amount', 'number', 'val', 'price', 'cost', 'total', 'sum'];
      for (const prop of numericProps) {
        if (prop in value && value[prop] !== undefined) {
          return parseRobustNumber(value[prop]);
        }
      }

      // Try converting the entire object to a number
      const asNumber = Number(value);
      if (!isNaN(asNumber) && isFinite(asNumber)) {
        return asNumber;
      }

      // Try JSON stringifying and extracting the first number
      const stringified = JSON.stringify(value);
      const matches = stringified.match(/[-+]?\d*\.?\d+/g);
      if (matches && matches.length > 0) {
        return parseFloat(matches[0]) || 0;
      }
  } catch {
      // If any errors occur during object processing, return 0
      return 0;
    }
    return 0;
  }

  // Fallback to 0 for any other type
  return 0;
}

/**
 * Safe number validation with range checking
 */
export function validateSafeNumber(value: any): {
  isValid: boolean;
  number: number;
  error?: string;
} {
  const parsed = parseRobustNumber(value);

  // Check for safe calculation range
  if (parsed > MAX_SAFE_CALCULATION_VALUE) {
    return {
      isValid: false,
      number: parsed,
      error: `Number is too large. Maximum supported value is ${formatLargeNumber(MAX_SAFE_CALCULATION_VALUE)}`
    };
  }

  if (parsed < MIN_SAFE_CALCULATION_VALUE) {
    return {
      isValid: false,
      number: parsed,
      error: `Number is too small. Minimum supported value is ${formatLargeNumber(MIN_SAFE_CALCULATION_VALUE)}`
    };
  }

  return {
    isValid: true,
    number: parsed
  };
}

/**
 * Format large numbers with appropriate suffixes (K, M, B, T)
 */
export function formatLargeNumber(value: number, decimals: number = 2): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1e12) {
    return `${sign}${(absValue / 1e12).toFixed(decimals)}T`;
  }
  if (absValue >= 1e9) {
    return `${sign}${(absValue / 1e9).toFixed(decimals)}B`;
  }
  if (absValue >= 1e6) {
    return `${sign}${(absValue / 1e6).toFixed(decimals)}M`;
  }
  if (absValue >= 1e3) {
    return `${sign}${(absValue / 1e3).toFixed(decimals)}K`;
  }
  
  return `${sign}${absValue.toFixed(decimals)}`;
}

/**
 * Format number with Indian number system (lakhs, crores)
 */
export function formatIndianNumber(value: number, decimals: number = 2): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1e7) {
    return `${sign}${(absValue / 1e7).toFixed(decimals)} Cr`;
  }
  if (absValue >= 1e5) {
    return `${sign}${(absValue / 1e5).toFixed(decimals)} L`;
  }
  if (absValue >= 1e3) {
    return `${sign}${(absValue / 1e3).toFixed(decimals)} K`;
  }
  
  return `${sign}${absValue.toFixed(decimals)}`;
}

/**
 * Format currency with proper Indian formatting
 */
export function formatCurrencyIndian(value: number, showSymbol: boolean = true): string {
  const parsed = parseRobustNumber(value);
  const formatter = new Intl.NumberFormat('en-IN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(parsed);
}

/**
 * Round number to specified decimal places, handling floating point precision
 */
export function roundToPrecision(value: number, decimals: number = 2): number {
  const parsed = parseRobustNumber(value);
  const factor = Math.pow(10, decimals);
  return Math.round((parsed + Number.EPSILON) * factor) / factor;
}

/**
 * Check if a number is effectively zero (within floating point tolerance)
 */
export function isEffectivelyZero(value: number, tolerance: number = 1e-10): boolean {
  const parsed = parseRobustNumber(value);
  return Math.abs(parsed) < tolerance;
}

/**
 * Safe division that handles division by zero
 */
export function safeDivide(numerator: any, denominator: any, fallback: number = 0): number {
  const num = parseRobustNumber(numerator);
  const den = parseRobustNumber(denominator);
  
  if (isEffectivelyZero(den)) {
    return fallback;
  }
  
  const result = num / den;
  return isFinite(result) ? result : fallback;
}

/**
 * Safe multiplication that handles overflow
 */
export function safeMultiply(a: any, b: any): number {
  const numA = parseRobustNumber(a);
  const numB = parseRobustNumber(b);
  
  const result = numA * numB;
  
  if (!isFinite(result) || result > MAX_SAFE_CALCULATION_VALUE) {
    return MAX_SAFE_CALCULATION_VALUE;
  }
  
  if (result < MIN_SAFE_CALCULATION_VALUE) {
    return MIN_SAFE_CALCULATION_VALUE;
  }
  
  return result;
}

/**
 * Safe addition that handles overflow
 */
export function safeAdd(...values: any[]): number {
  let result = 0;
  
  for (const value of values) {
    const parsed = parseRobustNumber(value);
    result += parsed;
    
    // Check for overflow
    if (result > MAX_SAFE_CALCULATION_VALUE) {
      return MAX_SAFE_CALCULATION_VALUE;
    }
    if (result < MIN_SAFE_CALCULATION_VALUE) {
      return MIN_SAFE_CALCULATION_VALUE;
    }
  }
  
  return result;
}

/**
 * Safe subtraction that handles overflow
 */
export function safeSubtract(a: any, b: any): number {
  const numA = parseRobustNumber(a);
  const numB = parseRobustNumber(b);
  
  const result = numA - numB;
  
  if (!isFinite(result) || result > MAX_SAFE_CALCULATION_VALUE) {
    return MAX_SAFE_CALCULATION_VALUE;
  }
  
  if (result < MIN_SAFE_CALCULATION_VALUE) {
    return MIN_SAFE_CALCULATION_VALUE;
  }
  
  return result;
}

/**
 * Safe power calculation with overflow protection
 */
export function safePower(base: any, exponent: any): number {
  const baseNum = parseRobustNumber(base);
  const expNum = parseRobustNumber(exponent);
  
  // Handle special cases
  if (isEffectivelyZero(baseNum) && expNum > 0) {
    return 0;
  }
  
  if (isEffectivelyZero(baseNum) && expNum < 0) {
    return Infinity;
  }
  
  if (isEffectivelyZero(expNum)) {
    return 1;
  }
  
  const result = Math.pow(baseNum, expNum);
  
  if (!isFinite(result) || result > MAX_SAFE_CALCULATION_VALUE) {
    return MAX_SAFE_CALCULATION_VALUE;
  }
  
  if (result < MIN_SAFE_CALCULATION_VALUE) {
    return MIN_SAFE_CALCULATION_VALUE;
  }
  
  return result;
}

/**
 * Convert percentage to decimal safely
 */
export function percentageToDecimal(percentage: any): number {
  const parsed = parseRobustNumber(percentage);
  return parsed / 100;
}

/**
 * Convert decimal to percentage safely
 */
export function decimalToPercentage(decimal: any): number {
  const parsed = parseRobustNumber(decimal);
  return parsed * 100;
}

/**
 * Clamp a number between min and max values
 */
export function clampNumber(value: any, min: number, max: number): number {
  const parsed = parseRobustNumber(value);
  return Math.min(Math.max(parsed, min), max);
}

/**
 * Check if a value represents a valid positive number
 */
export function isPositiveNumber(value: any): boolean {
  const parsed = parseRobustNumber(value);
  return parsed > 0 && isFinite(parsed);
}

/**
 * Check if a value represents a valid non-negative number (including zero)
 */
export function isNonNegativeNumber(value: any): boolean {
  const parsed = parseRobustNumber(value);
  return parsed >= 0 && isFinite(parsed);
}

/**
 * Parse and validate a number input with custom validation rules
 */
export function parseAndValidate(
  value: any,
  options: {
    min?: number;
    max?: number;
    allowZero?: boolean;
    allowNegative?: boolean;
    decimals?: number;
  } = {}
): {
  isValid: boolean;
  value: number;
  error?: string;
} {
  const {
    min = MIN_SAFE_CALCULATION_VALUE,
    max = MAX_SAFE_CALCULATION_VALUE,
    allowZero = true,
    allowNegative = true,
    decimals = PRECISION_DECIMAL_PLACES
  } = options;

  const parsed = parseRobustNumber(value);
  const rounded = roundToPrecision(parsed, decimals);

  // Check zero allowance
  if (!allowZero && isEffectivelyZero(rounded)) {
    return {
      isValid: false,
      value: rounded,
      error: 'Zero is not allowed'
    };
  }

  // Check negative allowance
  if (!allowNegative && rounded < 0) {
    return {
      isValid: false,
      value: rounded,
      error: 'Negative numbers are not allowed'
    };
  }

  // Check range
  if (rounded < min) {
    return {
      isValid: false,
      value: rounded,
      error: `Value must be at least ${formatLargeNumber(min)}`
    };
  }

  if (rounded > max) {
    return {
      isValid: false,
      value: rounded,
      error: `Value cannot exceed ${formatLargeNumber(max)}`
    };
  }

  return {
    isValid: true,
    value: rounded
  };
}

/**
 * Create a robust number parser for specific use cases
 */
export function createNumberParser(options: {
  min?: number;
  max?: number;
  allowZero?: boolean;
  allowNegative?: boolean;
  decimals?: number;
} = {}) {
  return (value: any) => parseAndValidate(value, options);
}

// Export commonly used parsers
export const parsePositiveNumber = createNumberParser({ 
  min: 0.01, 
  allowZero: false, 
  allowNegative: false 
});

export const parseNonNegativeNumber = createNumberParser({ 
  min: 0, 
  allowZero: true, 
  allowNegative: false 
});

export const parsePercentage = createNumberParser({ 
  min: 0, 
  max: 100, 
  allowZero: true, 
  allowNegative: false 
});

export const parseInterestRate = createNumberParser({ 
  min: 0, 
  max: 50, 
  allowZero: true, 
  allowNegative: false 
});
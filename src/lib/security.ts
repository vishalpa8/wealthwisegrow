/**
 * Security utilities for calculator operations
 * Provides secure calculation wrappers and input validation
 */

import { parseRobustNumber, validateSafeNumber } from './utils/number';

/**
 * Secure calculation wrapper that validates inputs and handles errors safely
 */
export function secureCalculation<T extends Record<string, any>, R>(
  inputs: T,
  calculationFn: (validatedInputs: T) => R,
  options: {
    requiredFields?: (keyof T)[];
    numericFields?: (keyof T)[];
    maxValues?: Partial<Record<keyof T, number>>;
    minValues?: Partial<Record<keyof T, number>>;
  } = {}
): { result?: R; error?: string } {
  try {
    const { requiredFields = [], numericFields = [], maxValues = {}, minValues = {} } = options;

    // Validate required fields
    for (const field of requiredFields) {
      if (inputs[field] === undefined || inputs[field] === null || inputs[field] === '') {
        return { error: `${String(field)} is required` };
      }
    }

    // Validate and sanitize numeric fields
    const validatedInputs = { ...inputs };
    for (const field of numericFields) {
      const value = inputs[field];
      const parsed = parseRobustNumber(value);
      
      // Check if parsing was successful
      if (isNaN(parsed) || !isFinite(parsed)) {
        return { error: `${String(field)} must be a valid number` };
      }

      // Validate against min/max constraints
      const minValue = minValues[field as keyof typeof minValues];
      const maxValue = maxValues[field as keyof typeof maxValues];
      
      if (minValue !== undefined && parsed < minValue) {
        return { error: `${String(field)} must be at least ${minValue}` };
      }
      
      if (maxValue !== undefined && parsed > maxValue) {
        return { error: `${String(field)} cannot exceed ${maxValue}` };
      }

      // Validate safe number range
      const validation = validateSafeNumber(parsed);
      if (!validation.isValid) {
        return { error: validation.error || `${String(field)} is out of safe range` };
      }

      validatedInputs[field] = parsed as T[keyof T];
    }

    // Execute the calculation with validated inputs
    const result = calculationFn(validatedInputs);
    
    return { result };
  } catch (error) {
    console.error('Secure calculation error:', error);
    return { error: 'Calculation failed due to an unexpected error' };
  }
}

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove potentially dangerous characters
    return input
      .replace(/[<>'&]/g, '') // Remove HTML/XML characters
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }
  
  if (typeof input === 'number') {
    return parseRobustNumber(input);
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInput(key)] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

/**
 * Rate limiting for calculation requests
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

// Global rate limiter instance
const globalRateLimiter = new RateLimiter();

/**
 * Check if calculation request is within rate limits
 */
export function checkRateLimit(identifier: string = 'default'): boolean {
  return globalRateLimiter.isAllowed(identifier);
}

/**
 * Validate calculation context for security
 */
export function validateCalculationContext(context: {
  userAgent?: string;
  origin?: string;
  timestamp?: number;
}): boolean {
  const { userAgent, timestamp } = context;
  
  // Check for suspicious user agents
  if (userAgent) {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
      return false;
    }
  }
  
  // Check timestamp for replay attacks (requests older than 5 minutes)
  if (timestamp) {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    if (timestamp < fiveMinutesAgo) {
      return false;
    }
  }
  
  return true;
}

/**
 * Secure wrapper for financial calculations with comprehensive validation
 */
export function secureFinancialCalculation<T extends Record<string, any>, R>(
  inputs: T,
  calculationFn: (inputs: T) => R,
  validationRules: {
    required?: (keyof T)[];
    numeric?: (keyof T)[];
    positive?: (keyof T)[];
    percentage?: (keyof T)[];
    currency?: (keyof T)[];
    maxValues?: Partial<Record<keyof T, number>>;
    minValues?: Partial<Record<keyof T, number>>;
  } = {}
): { result?: R; error?: string; warnings?: string[] } {
  const warnings: string[] = [];
  
  try {
    // Sanitize all inputs
    const sanitizedInputs = sanitizeInput(inputs);
    
    // Apply validation rules
    const {
      required = [],
      numeric = [],
      positive = [],
      percentage = [],
      currency = [],
      maxValues = {},
      minValues = {}
    } = validationRules;
    
    // Combine all numeric field types
    const allNumericFields = [...new Set([...numeric, ...positive, ...percentage, ...currency])];
    
    // Use secure calculation with enhanced validation
    const secureResult = secureCalculation(
      sanitizedInputs,
      calculationFn,
      {
        requiredFields: required,
        numericFields: allNumericFields,
        maxValues,
        minValues
      }
    );
    
    if (secureResult.error) {
      return { error: secureResult.error };
    }
    
    // Additional validation for specific field types
    for (const field of positive) {
      const value = parseRobustNumber(sanitizedInputs[field]);
      if (value <= 0) {
        return { error: `${String(field)} must be positive` };
      }
    }
    
    for (const field of percentage) {
      const value = parseRobustNumber(sanitizedInputs[field]);
      if (value < 0 || value > 100) {
        warnings.push(`${String(field)} should typically be between 0% and 100%`);
      }
    }
    
    for (const field of currency) {
      const value = parseRobustNumber(sanitizedInputs[field]);
      if (value < 0) {
        return { error: `${String(field)} cannot be negative` };
      }
      if (value > 1e12) {
        warnings.push(`${String(field)} is unusually large`);
      }
    }
    
    return {
      result: secureResult.result,
      warnings: warnings.length > 0 ? warnings : undefined
    };
    
  } catch (error) {
    console.error('Secure financial calculation error:', error);
    return { error: 'Financial calculation failed due to an unexpected error' };
  }
}

/**
 * Export rate limiter for external use
 */
export { RateLimiter };
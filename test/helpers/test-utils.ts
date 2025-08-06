/**
 * Universal Test Utilities for Financial Calculator Tests
 * Provides consistent precision handling and mathematical comparisons
 */

export interface FinancialComparisonOptions {
  tolerance?: number;
  percentage?: boolean;
  currency?: boolean;
}

/**
 * Financial-aware comparison function
 * Handles floating point precision issues common in financial calculations
 */
export function expectFinanciallyCloseTo(
  actual: number,
  expected: number,
  options: FinancialComparisonOptions = {}
): void {
  const {
    tolerance,
    percentage = false,
    currency = false
  } = options;

  // Determine appropriate tolerance based on context
  let finalTolerance: number;
  
  if (tolerance !== undefined) {
    finalTolerance = tolerance;
  } else if (percentage) {
    // For percentages, allow 0.01% difference
    finalTolerance = 0.01;
  } else if (currency) {
    // For currency, allow 1 cent difference for values under 1000
    // or 0.01% for larger values
    finalTolerance = Math.abs(expected) > 1000 ? Math.abs(expected) * 0.0001 : 0.01;
  } else {
    // General case: allow small floating point differences
    finalTolerance = Math.abs(expected) > 10000 ? 1 : 0.01;
  }

  const difference = Math.abs(actual - expected);
  
  if (difference > finalTolerance) {
    throw new Error(
      `Expected ${actual} to be close to ${expected} (tolerance: ${finalTolerance}), but difference was ${difference}`
    );
  }
}

/**
 * Expect two financial values to be approximately equal
 */
export function expectCurrencyCloseTo(actual: number, expected: number, tolerance = 0.01): void {
  expectFinanciallyCloseTo(actual, expected, { currency: true, tolerance });
}

/**
 * Expect two percentage values to be approximately equal
 */
export function expectPercentageCloseTo(actual: number, expected: number, tolerance = 0.01): void {
  expectFinanciallyCloseTo(actual, expected, { percentage: true, tolerance });
}

/**
 * Expect mathematical relationship to hold (like totalGains = maturityAmount - principal)
 */
export function expectMathematicalRelation(
  actual: number,
  expected: number,
  relationship: string,
  tolerance = 0.01
): void {
  const difference = Math.abs(actual - expected);
  if (difference > tolerance) {
    throw new Error(
      `Mathematical relationship "${relationship}" failed: ${actual} ≠ ${expected} (difference: ${difference})`
    );
  }
}

/**
 * Check if a value is a valid finite number
 */
export function expectValidNumber(value: any, fieldName: string): void {
  expect(typeof value).toBe('number');
  expect(Number.isFinite(value)).toBe(true);
  expect(Number.isNaN(value)).toBe(false);
}

/**
 * Validate common financial calculation results
 */
export function validateFinancialResult(result: any, expectedFields: string[]): void {
  expect(result).toBeDefined();
  expect(typeof result).toBe('object');
  
  expectedFields.forEach(field => {
    expect(result).toHaveProperty(field);
    expectValidNumber(result[field], field);
  });
}

/**
 * For range-based expectations (useful for complex calculations)
 */
export function expectInRange(actual: number, min: number, max: number, fieldName?: string): void {
  const prefix = fieldName ? `${fieldName}: ` : '';
  expect(actual).toBeGreaterThanOrEqual(min);
  expect(actual).toBeLessThanOrEqual(max);
}

/**
 * Jest custom matcher for financial calculations
 */
expect.extend({
  toBeFinanciallyCloseTo(received: number, expected: number, options: FinancialComparisonOptions = {}) {
    try {
      expectFinanciallyCloseTo(received, expected, options);
      return {
        message: () => `Expected ${received} not to be financially close to ${expected}`,
        pass: true,
      };
    } catch (error) {
      return {
        message: () => (error as Error).message,
        pass: false,
      };
    }
  },
});

// Type augmentation for custom matcher
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeFinanciallyCloseTo(expected: number, options?: FinancialComparisonOptions): R;
    }
  }
}

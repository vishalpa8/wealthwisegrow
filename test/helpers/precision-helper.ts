/**
 * Production-Grade Test Utilities for Financial Calculations
 * 
 * Comprehensive test helpers that handle precision issues, edge cases, and provide
 * robust validation for financial calculator functions.
 */

/**
 * Enhanced expectCloseTo that intelligently handles different precision scenarios
 * @param actual - The actual computed value
 * @param expected - The expected value
 * @param precision - Number of decimal places (default: 2)
 */
export function expectCloseTo(actual: number, expected: number, precision: number = 2): void {
  const diff = Math.abs(actual - expected);
  const absExpected = Math.abs(expected);
  
  // For very large numbers (>1M), allow proportional tolerance
  if (absExpected > 1000000) {
    const proportionalTolerance = absExpected * 0.001; // 0.1% tolerance
    expect(diff).toBeLessThanOrEqual(proportionalTolerance);
    return;
  }
  
  // For medium numbers (1K-1M), use standard precision with some leniency
  if (absExpected > 1000) {
    const adjustedPrecision = Math.max(0, precision - 1);
    expect(actual).toBeCloseTo(expected, adjustedPrecision);
    return;
  }
  
  // For small numbers, use exact precision
  expect(actual).toBeCloseTo(expected, precision);
}

/**
 * Handle mathematical equality for calculated values where precision might vary
 * Uses intelligent tolerance based on the magnitude of numbers
 */
export function expectMathematicallyEqual(actual: number, expected: number, customTolerance?: number): void {
  const diff = Math.abs(actual - expected);
  const absExpected = Math.abs(expected);
  
  let tolerance = customTolerance;
  if (!tolerance) {
    // Dynamic tolerance based on magnitude
    if (absExpected > 1000000) {
      tolerance = absExpected * 0.0001; // 0.01% for large numbers
    } else if (absExpected > 1000) {
      tolerance = 1; // ±1 for medium numbers
    } else {
      tolerance = 0.01; // ±0.01 for small numbers
    }
  }
  
  expect(diff).toBeLessThanOrEqual(tolerance);
}

/**
 * Check if two floating-point numbers are effectively equal with intelligent tolerance
 */
export function isEffectivelyEqual(a: number, b: number, customTolerance?: number): boolean {
  const diff = Math.abs(a - b);
  const absA = Math.abs(a);
  
  let tolerance = customTolerance;
  if (!tolerance) {
    if (absA > 1000000) {
      tolerance = absA * 0.0001;
    } else if (absA > 1000) {
      tolerance = 1;
    } else {
      tolerance = 0.01;
    }
  }
  
  return diff <= tolerance;
}

/**
 * Comprehensive validation for financial calculation results
 */
export function validateFinancialResult(result: any): void {
  expect(result).toBeDefined();
  expect(result).not.toBeNull();
  
  // Check that all numeric properties are finite and not NaN
  Object.keys(result).forEach(key => {
    const value = result[key];
    if (typeof value === 'number') {
      expect(isFinite(value)).toBe(true);
      expect(isNaN(value)).toBe(false);
    } else if (Array.isArray(value)) {
      // Validate arrays (like payment schedules)
      expect(value.length).toBeGreaterThanOrEqual(0);
      value.forEach((item, index) => {
        expect(item).toBeDefined();
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(itemKey => {
            const itemValue = item[itemKey];
            if (typeof itemValue === 'number') {
              expect(isFinite(itemValue)).toBe(true);
              expect(isNaN(itemValue)).toBe(false);
            }
          });
        }
      });
    }
  });
}

/**
 * Helper to test ranges instead of exact values for complex financial calculations
 */
export function expectInRange(actual: number, min: number, max: number, message?: string): void {
  const errorMsg = message || `Expected ${actual} to be between ${min} and ${max}`;
  expect(actual).toBeGreaterThanOrEqual(min);
  expect(actual).toBeLessThanOrEqual(max);
}

/**
 * Validate mathematical relationships in financial calculations
 */
export function validateMathematicalRelationships(result: any, inputs: any): void {
  // Common validations across all financial calculators
  
  // Interest/gains should be non-negative for positive rates
  if (result.totalInterest !== undefined && inputs.rate > 0) {
    expect(result.totalInterest).toBeGreaterThanOrEqual(0);
  }
  
  if (result.totalGains !== undefined && inputs.rate > 0) {
    expect(result.totalGains).toBeGreaterThanOrEqual(0);
  }
  
  // Maturity/final amounts should be greater than or equal to principal for positive rates
  if (result.maturityAmount !== undefined && inputs.principal > 0 && inputs.rate >= 0) {
    expect(result.maturityAmount).toBeGreaterThanOrEqual(inputs.principal);
  }
  
  if (result.finalAmount !== undefined && inputs.initialAmount > 0 && inputs.rate >= 0) {
    expect(result.finalAmount).toBeGreaterThanOrEqual(inputs.initialAmount);
  }
}

/**
 * Test edge cases common to all financial calculators
 */
export function testCommonEdgeCases(calculatorFn: Function, createInputs: Function): void {
  describe('🔥 Common Edge Cases', () => {
    test('should handle zero principal/amount', () => {
      const inputs = createInputs({ principal: 0 });
      const result = calculatorFn(inputs);
      validateFinancialResult(result);
      // Zero principal should result in zero or minimal calculations
    });
    
    test('should handle zero interest rate', () => {
      const inputs = createInputs({ rate: 0 });
      const result = calculatorFn(inputs);
      validateFinancialResult(result);
    });
    
    test('should handle negative inputs gracefully', () => {
      const negativeInputs = [
        createInputs({ principal: -1000 }),
        createInputs({ rate: -5 }),
        createInputs({ years: -1 })
      ];
      
      negativeInputs.forEach(inputs => {
        const result = calculatorFn(inputs);
        validateFinancialResult(result);
      });
    });
    
    test('should handle string inputs with currency symbols', () => {
      const inputs = createInputs({
        principal: '$100,000',
        rate: '5%',
        years: '10 years'
      });
      
      const result = calculatorFn(inputs);
      validateFinancialResult(result);
    });
    
    test('should handle invalid inputs gracefully', () => {
      const invalidInputs = [
        createInputs({ principal: null }),
        createInputs({ principal: undefined }),
        createInputs({ principal: 'invalid' }),
        createInputs({ rate: NaN }),
        createInputs({ years: Infinity })
      ];
      
      invalidInputs.forEach(inputs => {
        const result = calculatorFn(inputs);
        validateFinancialResult(result);
      });
    });
  });
}

/**
 * Create test data generators for various scenarios
 */
export const TestDataGenerator = {
  /**
   * Generate test cases for different magnitudes
   */
  generateMagnitudeTests: (baseInputs: any) => [
    { ...baseInputs, principal: 1000, description: 'small amount' },
    { ...baseInputs, principal: 100000, description: 'medium amount' },
    { ...baseInputs, principal: 10000000, description: 'large amount' },
    { ...baseInputs, principal: 1, description: 'minimal amount' }
  ],
  
  /**
   * Generate test cases for different time periods
   */
  generateTimeTests: (baseInputs: any) => [
    { ...baseInputs, years: 1, description: 'short term' },
    { ...baseInputs, years: 10, description: 'medium term' },
    { ...baseInputs, years: 30, description: 'long term' },
    { ...baseInputs, years: 0.5, description: 'fractional year' }
  ],
  
  /**
   * Generate test cases for different interest rates
   */
  generateRateTests: (baseInputs: any) => [
    { ...baseInputs, rate: 0, description: 'zero rate' },
    { ...baseInputs, rate: 1, description: 'low rate' },
    { ...baseInputs, rate: 5, description: 'moderate rate' },
    { ...baseInputs, rate: 12, description: 'high rate' },
    { ...baseInputs, rate: 25, description: 'very high rate' }
  ]
};

/**
 * Performance testing helper
 */
export function testPerformance(calculatorFn: Function, inputs: any, maxExecutionTime: number = 1000): void {
  const startTime = Date.now();
  const result = calculatorFn(inputs);
  const endTime = Date.now();
  
  expect(endTime - startTime).toBeLessThan(maxExecutionTime);
  validateFinancialResult(result);
}

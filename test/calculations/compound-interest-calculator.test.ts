/**
 * Comprehensive Test Suite for Compound Interest Calculator
 * Tests both compound and simple interest calculations
 * Priority: HIGH - Core financial calculation with complex mathematical formulas
 */

// Mock the compound interest calculation functions extracted from the component
function calculateCompoundInterest(inputs: {
  principal: number;
  rate: number;
  time: number;
  compoundingFrequency: string;
}) {
  const parseRobustNumber = (value: any) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d.-]/g, '');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  };

  const safeDivide = (a: number, b: number) => b === 0 ? 0 : a / b;
  const safeMultiply = (a: number, b: number) => a * b;
  const safePower = (base: number, exponent: number) => Math.pow(base, exponent);
  const safeAdd = (a: number, b: number) => a + b;
  const safeSubtract = (a: number, b: number) => a - b;
  const roundToPrecision = (value: number, precision: number = 2) => 
    Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);

  const principal = Math.abs(parseRobustNumber(inputs.principal) || 0);
  const rate = Math.abs(parseRobustNumber(inputs.rate) || 0);
  const time = Math.abs(parseRobustNumber(inputs.time) || 1);
  const { compoundingFrequency } = inputs;

  const frequencies: Record<string, number> = {
    'yearly': 1,
    'half-yearly': 2,
    'quarterly': 4,
    'monthly': 12,
    'daily': 365
  };

  const n = frequencies[compoundingFrequency] || 1;
  const r = safeDivide(rate, 100);

  const ratePerPeriod = safeDivide(r, n);
  const periodsTotal = safeMultiply(n, time);

  if (periodsTotal > 1000) {
    throw new Error('Calculation period too long - risk of overflow');
  }

  const compoundFactor = safePower(safeAdd(1, ratePerPeriod), periodsTotal);
  
  if (!isFinite(compoundFactor) || compoundFactor === 0) {
    throw new Error('Calculation overflow or underflow');
  }

  const totalAmount = safeMultiply(principal, compoundFactor);
  const compoundInterest = safeSubtract(totalAmount, principal);

  const simpleInterest = safeDivide(
    safeMultiply(safeMultiply(principal, rate), time),
    100
  );

  const additionalEarnings = safeSubtract(compoundInterest, simpleInterest);
  const effectiveAnnualRate = safeMultiply(
    safeSubtract(safePower(compoundFactor, safeDivide(1, time)), 1),
    100
  );

  return {
    principal: roundToPrecision(principal),
    totalAmount: roundToPrecision(totalAmount),
    compoundInterest: roundToPrecision(compoundInterest),
    simpleInterest: roundToPrecision(simpleInterest),
    additionalEarnings: roundToPrecision(additionalEarnings),
    effectiveAnnualRate: roundToPrecision(effectiveAnnualRate),
    compoundingFrequency: n
  };
}

function calculateSimpleInterest(inputs: {
  principal: number;
  rate: number;
  time: number;
}) {
  const parseRobustNumber = (value: any) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d.-]/g, '');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  };

  const safeDivide = (a: number, b: number) => b === 0 ? 0 : a / b;
  const safeMultiply = (a: number, b: number) => a * b;
  const safeAdd = (a: number, b: number) => a + b;
  const roundToPrecision = (value: number, precision: number = 2) => 
    Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);

  const principal = Math.abs(parseRobustNumber(inputs.principal) || 0);
  const rate = Math.abs(parseRobustNumber(inputs.rate) || 0);
  const time = Math.abs(parseRobustNumber(inputs.time) || 1);

  const simpleInterest = safeDivide(
    safeMultiply(safeMultiply(principal, rate), time),
    100
  );

  const totalAmount = safeAdd(principal, simpleInterest);

  return {
    principal: roundToPrecision(principal),
    simpleInterest: roundToPrecision(simpleInterest),
    totalAmount: roundToPrecision(totalAmount),
    effectiveRate: roundToPrecision(safeDivide(safeMultiply(simpleInterest, 100), principal)),
    monthlyInterest: roundToPrecision(safeDivide(simpleInterest, safeMultiply(time, 12)))
  };
}

describe('Compound Interest Calculator - Comprehensive Test Suite', () => {

  // Helper function to create compound interest inputs
  const createCompoundInputs = (overrides: any = {}) => ({
    principal: 100000,
    rate: 8,
    time: 5,
    compoundingFrequency: 'yearly',
    ...overrides,
  });

  // Helper function to create simple interest inputs
  const createSimpleInputs = (overrides: any = {}) => ({
    principal: 100000,
    rate: 8,
    time: 5,
    ...overrides,
  });

  // Helper function for precise decimal comparison
  const expectCloseTo = (actual: number, expected: number, precision: number = 2) => {
    expect(actual).toBeCloseTo(expected, precision);
  };

  describe('🧮 Compound Interest Calculation Tests', () => {
    
    test('should calculate basic compound interest correctly', () => {
      const inputs = createCompoundInputs({
        principal: 100000,
        rate: 8,
        time: 5,
        compoundingFrequency: 'yearly'
      });

      const result = calculateCompoundInterest(inputs);

      // A = P(1 + r/n)^(nt) = 100000(1 + 0.08/1)^(1*5) = 100000(1.08)^5 ≈ 146,932.81
      expectCloseTo(result.totalAmount, 146932.81, 1);
      expectCloseTo(result.compoundInterest, 46932.81, 1);
      expect(result.principal).toBe(100000);
      expect(result.compoundingFrequency).toBe(1);
    });

    test('should calculate compound interest with different frequencies', () => {
      const testCases = [
        { frequency: 'yearly', n: 1, expectedAmount: 146932.81 },
        { frequency: 'half-yearly', n: 2, expectedAmount: 147009.46 },
        { frequency: 'quarterly', n: 4, expectedAmount: 147048.14 },
        { frequency: 'monthly', n: 12, expectedAmount: 147073.44 },
        { frequency: 'daily', n: 365, expectedAmount: 147092.83 },
      ];

      testCases.forEach(({ frequency, n, expectedAmount }) => {
        const inputs = createCompoundInputs({
          principal: 100000,
          rate: 8,
          time: 5,
          compoundingFrequency: frequency
        });

        const result = calculateCompoundInterest(inputs);

        expect(result.compoundingFrequency).toBe(n);
        expectCloseTo(result.totalAmount, expectedAmount, 1);
        
        // More frequent compounding should yield higher returns
        expect(result.totalAmount).toBeGreaterThan(result.principal);
      });
    });

    test('should calculate effective annual rate correctly', () => {
      const inputs = createCompoundInputs({
        principal: 100000,
        rate: 12,
        time: 1,
        compoundingFrequency: 'monthly'
      });

      const result = calculateCompoundInterest(inputs);

      // EAR = (1 + r/n)^n - 1 = (1 + 0.12/12)^12 - 1 ≈ 12.68%
      expectCloseTo(result.effectiveAnnualRate, 12.68, 1);
    });

    test('should compare compound vs simple interest', () => {
      const inputs = createCompoundInputs({
        principal: 100000,
        rate: 10,
        time: 3,
        compoundingFrequency: 'yearly'
      });

      const result = calculateCompoundInterest(inputs);

      // Simple interest = P * r * t / 100 = 100000 * 10 * 3 / 100 = 30000
      expect(result.simpleInterest).toBe(30000);
      
      // Compound interest should be higher
      expect(result.compoundInterest).toBeGreaterThan(result.simpleInterest);
      
      // Additional earnings from compounding
      expect(result.additionalEarnings).toBe(result.compoundInterest - result.simpleInterest);
      expectCloseTo(result.additionalEarnings, 3100, 100); // Approximately 3100
    });

    test('should handle different time periods', () => {
      const testCases = [
        { time: 1, expectedRange: [108000, 109000] },
        { time: 5, expectedRange: [146000, 148000] },
        { time: 10, expectedRange: [215000, 220000] },
        { time: 20, expectedRange: [465000, 475000] },
      ];

      testCases.forEach(({ time, expectedRange }) => {
        const inputs = createCompoundInputs({
          principal: 100000,
          rate: 8,
          time,
          compoundingFrequency: 'yearly'
        });

        const result = calculateCompoundInterest(inputs);

        expect(result.totalAmount).toBeGreaterThanOrEqual(expectedRange[0]);
        expect(result.totalAmount).toBeLessThanOrEqual(expectedRange[1]);
      });
    });
  });

  describe('📊 Simple Interest Calculation Tests', () => {
    
    test('should calculate basic simple interest correctly', () => {
      const inputs = createSimpleInputs({
        principal: 100000,
        rate: 8,
        time: 5
      });

      const result = calculateSimpleInterest(inputs);

      // SI = P * r * t / 100 = 100000 * 8 * 5 / 100 = 40000
      expect(result.simpleInterest).toBe(40000);
      expect(result.totalAmount).toBe(140000); // 100000 + 40000
      expect(result.principal).toBe(100000);
    });

    test('should calculate effective rate correctly', () => {
      const inputs = createSimpleInputs({
        principal: 50000,
        rate: 12,
        time: 3
      });

      const result = calculateSimpleInterest(inputs);

      // Simple interest = 50000 * 12 * 3 / 100 = 18000
      // Effective rate = (18000 * 100) / 50000 = 36%
      expect(result.simpleInterest).toBe(18000);
      expect(result.effectiveRate).toBe(36);
    });

    test('should calculate monthly interest correctly', () => {
      const inputs = createSimpleInputs({
        principal: 120000,
        rate: 10,
        time: 2
      });

      const result = calculateSimpleInterest(inputs);

      // Simple interest = 120000 * 10 * 2 / 100 = 24000
      // Monthly interest = 24000 / (2 * 12) = 1000
      expect(result.simpleInterest).toBe(24000);
      expect(result.monthlyInterest).toBe(1000);
    });

    test('should handle different principal amounts', () => {
      const testCases = [
        { principal: 50000, expectedInterest: 20000 },
        { principal: 100000, expectedInterest: 40000 },
        { principal: 200000, expectedInterest: 80000 },
      ];

      testCases.forEach(({ principal, expectedInterest }) => {
        const inputs = createSimpleInputs({
          principal,
          rate: 8,
          time: 5
        });

        const result = calculateSimpleInterest(inputs);
        expect(result.simpleInterest).toBe(expectedInterest);
      });
    });
  });

  describe('🔥 Edge Cases & Boundary Tests', () => {
    
    test('should handle zero principal amount', () => {
      const compoundInputs = createCompoundInputs({ principal: 0 });
      const simpleInputs = createSimpleInputs({ principal: 0 });

      const compoundResult = calculateCompoundInterest(compoundInputs);
      const simpleResult = calculateSimpleInterest(simpleInputs);

      expect(compoundResult.totalAmount).toBe(0);
      expect(compoundResult.compoundInterest).toBe(0);
      expect(simpleResult.totalAmount).toBe(0);
      expect(simpleResult.simpleInterest).toBe(0);
    });

    test('should handle zero interest rate', () => {
      const compoundInputs = createCompoundInputs({ rate: 0 });
      const simpleInputs = createSimpleInputs({ rate: 0 });

      const compoundResult = calculateCompoundInterest(compoundInputs);
      const simpleResult = calculateSimpleInterest(simpleInputs);

      expect(compoundResult.totalAmount).toBe(compoundResult.principal);
      expect(compoundResult.compoundInterest).toBe(0);
      expect(simpleResult.totalAmount).toBe(simpleResult.principal);
      expect(simpleResult.simpleInterest).toBe(0);
    });

    test('should handle zero time period', () => {
      const compoundInputs = createCompoundInputs({ time: 0 });
      const simpleInputs = createSimpleInputs({ time: 0 });

      const compoundResult = calculateCompoundInterest(compoundInputs);
      const simpleResult = calculateSimpleInterest(simpleInputs);

      expect(compoundResult.totalAmount).toBe(compoundResult.principal);
      expect(compoundResult.compoundInterest).toBe(0);
      expect(simpleResult.totalAmount).toBe(simpleResult.principal);
      expect(simpleResult.simpleInterest).toBe(0);
    });

    test('should handle very high interest rates', () => {
      const inputs = createCompoundInputs({
        principal: 10000,
        rate: 50, // 50% interest
        time: 3,
        compoundingFrequency: 'yearly'
      });

      const result = calculateCompoundInterest(inputs);

      // A = 10000(1.5)^3 = 10000 * 3.375 = 33750
      expectCloseTo(result.totalAmount, 33750, 1);
      expect(result.compoundInterest).toBeGreaterThan(20000);
    });

    test('should handle very long time periods', () => {
      const inputs = createCompoundInputs({
        principal: 10000,
        rate: 5,
        time: 50, // 50 years
        compoundingFrequency: 'yearly'
      });

      const result = calculateCompoundInterest(inputs);

      // Should grow significantly over 50 years
      expect(result.totalAmount).toBeGreaterThan(100000);
      expect(result.compoundInterest).toBeGreaterThan(result.simpleInterest);
    });

    test('should handle fractional inputs', () => {
      const inputs = createCompoundInputs({
        principal: 100000.50,
        rate: 8.25,
        time: 5.5,
        compoundingFrequency: 'monthly'
      });

      const result = calculateCompoundInterest(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.totalAmount)).toBe(true);
      expect(Number.isFinite(result.compoundInterest)).toBe(true);
    });

    test('should prevent overflow with extreme periods', () => {
      const inputs = createCompoundInputs({
        principal: 100000,
        rate: 10,
        time: 100, // Very long period
        compoundingFrequency: 'daily'
      });

      expect(() => {
        calculateCompoundInterest(inputs);
      }).toThrow('Calculation period too long - risk of overflow');
    });
  });

  describe('🛡️ Input Validation & Robustness Tests', () => {
    
    test('should handle invalid principal inputs', () => {
      const testCases = [
        { principal: null },
        { principal: undefined },
        { principal: '' },
        { principal: 'invalid' },
        { principal: -100000 }, // Negative principal
      ];

      testCases.forEach(({ principal }) => {
        const inputs = createCompoundInputs({ principal: principal as any });
        const result = calculateCompoundInterest(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.totalAmount).toBe('number');
        expect(isFinite(result.totalAmount)).toBe(true);
      });
    });

    test('should handle string inputs with currency symbols', () => {
      const inputs = createCompoundInputs({
        principal: '₹1,00,000' as any,
        rate: '8%' as any,
        time: '5 years' as any,
        compoundingFrequency: 'monthly'
      });

      const result = calculateCompoundInterest(inputs);

      expect(result).toBeDefined();
      expect(result.principal).toBeGreaterThan(0);
      expect(result.totalAmount).toBeGreaterThan(result.principal);
    });

    test('should handle unknown compounding frequency', () => {
      const inputs = createCompoundInputs({
        compoundingFrequency: 'unknown'
      });

      const result = calculateCompoundInterest(inputs);

      // Should default to yearly (1)
      expect(result.compoundingFrequency).toBe(1);
      expect(result.totalAmount).toBeGreaterThan(result.principal);
    });

    test('should handle floating point precision issues', () => {
      const inputs = createCompoundInputs({
        principal: 100000.123456789,
        rate: 8.987654321,
        time: 5.123456789,
        compoundingFrequency: 'monthly'
      });

      const result = calculateCompoundInterest(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.totalAmount)).toBe(true);
      expect(Number.isFinite(result.compoundInterest)).toBe(true);
    });
  });

  describe('🧮 Mathematical Accuracy Tests', () => {
    
    test('should verify compound interest formula accuracy', () => {
      const inputs = createCompoundInputs({
        principal: 50000,
        rate: 6,
        time: 4,
        compoundingFrequency: 'quarterly'
      });

      const result = calculateCompoundInterest(inputs);

      // Manual calculation: A = P(1 + r/n)^(nt)
      // A = 50000(1 + 0.06/4)^(4*4) = 50000(1.015)^16 ≈ 63,412.09
      expectCloseTo(result.totalAmount, 63412.09, 1);
      expectCloseTo(result.compoundInterest, 13412.09, 1);
    });

    test('should verify simple interest formula accuracy', () => {
      const inputs = createSimpleInputs({
        principal: 75000,
        rate: 9,
        time: 6
      });

      const result = calculateSimpleInterest(inputs);

      // Manual calculation: SI = P * r * t / 100
      // SI = 75000 * 9 * 6 / 100 = 40500
      expect(result.simpleInterest).toBe(40500);
      expect(result.totalAmount).toBe(115500); // 75000 + 40500
    });

    test('should verify effective annual rate calculation', () => {
      const testCases = [
        { rate: 12, frequency: 'monthly', expectedEAR: 12.68 },
        { rate: 8, frequency: 'quarterly', expectedEAR: 8.24 },
        { rate: 6, frequency: 'half-yearly', expectedEAR: 6.09 },
      ];

      testCases.forEach(({ rate, frequency, expectedEAR }) => {
        const inputs = createCompoundInputs({
          principal: 100000,
          rate,
          time: 1,
          compoundingFrequency: frequency
        });

        const result = calculateCompoundInterest(inputs);
        expectCloseTo(result.effectiveAnnualRate, expectedEAR, 1);
      });
    });

    test('should verify compounding frequency impact', () => {
      const baseInputs = {
        principal: 100000,
        rate: 10,
        time: 5
      };

      const frequencies = ['yearly', 'half-yearly', 'quarterly', 'monthly', 'daily'];
      const results = frequencies.map(frequency => 
        calculateCompoundInterest({ ...baseInputs, compoundingFrequency: frequency })
      );

      // Each subsequent frequency should yield higher or equal returns
      for (let i = 1; i < results.length; i++) {
        expect(results[i].totalAmount).toBeGreaterThanOrEqual(results[i - 1].totalAmount);
      }
    });
  });

  describe('⚡ Performance & Stress Tests', () => {
    
    test('should handle large principal amounts efficiently', () => {
      const inputs = createCompoundInputs({
        principal: 100000000, // 10 crores
        rate: 8,
        time: 10,
        compoundingFrequency: 'monthly'
      });

      const startTime = Date.now();
      const result = calculateCompoundInterest(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(result.totalAmount).toBeGreaterThan(200000000); // Should be over 20 crores
    });

    test('should handle multiple calculations efficiently', () => {
      const testCases = Array.from({ length: 1000 }, (_, i) => ({
        principal: 50000 + i * 1000,
        rate: 5 + i % 10,
        time: 1 + i % 20,
        compoundingFrequency: ['yearly', 'monthly', 'quarterly'][i % 3]
      }));

      const startTime = Date.now();
      
      testCases.forEach(inputs => {
        const result = calculateCompoundInterest(inputs);
        expect(result).toBeDefined();
        expect(result.totalAmount).toBeGreaterThan(0);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('🔍 Regression Tests', () => {
    
    test('should maintain consistent results for known scenarios', () => {
      // Known test case with expected results
      const inputs = createCompoundInputs({
        principal: 100000,
        rate: 8,
        time: 5,
        compoundingFrequency: 'yearly'
      });

      const result = calculateCompoundInterest(inputs);

      // These values should remain consistent across code changes
      expect(result.principal).toBe(100000);
      expectCloseTo(result.totalAmount, 146932.81, 1);
      expectCloseTo(result.compoundInterest, 46932.81, 1);
      expect(result.simpleInterest).toBe(40000);
      expectCloseTo(result.additionalEarnings, 6932.81, 1);
    });

    test('should verify mathematical relationships', () => {
      const inputs = createCompoundInputs({
        principal: 200000,
        rate: 10,
        time: 3,
        compoundingFrequency: 'quarterly'
      });

      const result = calculateCompoundInterest(inputs);

      // Mathematical relationships that should always hold
      expect(result.compoundInterest).toBe(result.totalAmount - result.principal);
      expect(result.additionalEarnings).toBe(result.compoundInterest - result.simpleInterest);
      expect(result.totalAmount).toBeGreaterThan(result.principal);
      expect(result.compoundInterest).toBeGreaterThanOrEqual(result.simpleInterest);
    });
  });
});
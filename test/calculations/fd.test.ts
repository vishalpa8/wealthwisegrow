/**
 * Comprehensive Test Suite for FD Calculator
 * Tests all edge cases, scenarios, and mathematical accuracy
 * Priority: MEDIUM - Fixed Deposit calculations with different compounding frequencies
 */

import { calculateFD } from '../../src/lib/calculations/savings';
import type { FDInputs, FDResults } from '../../src/lib/calculations/savings';

describe('FD Calculator - Comprehensive Test Suite', () => {
  
  // Helper function to create FD inputs
  const createFDInputs = (overrides: Partial<FDInputs> = {}): FDInputs => ({
    principal: 100000,
    annualRate: 7,
    years: 5,
    compoundingFrequency: 'quarterly',
    ...overrides,
  });

  // Helper function for precise decimal comparison
  const expectCloseTo = (actual: number, expected: number, precision: number = 2) => {
    expect(actual).toBeCloseTo(expected, precision);
  };

  describe('🎯 Basic Functionality Tests', () => {
    
    test('should calculate standard FD correctly', () => {
      const inputs = createFDInputs({
        principal: 100000,
        annualRate: 7,
        years: 5,
        compoundingFrequency: 'quarterly',
      });

      const result = calculateFD(inputs);

      expect(result.principal).toBe(100000);
      expect(result.maturityAmount).toBeGreaterThan(100000);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.totalInterest).toBe(result.maturityAmount - result.principal);
      expect(result.effectiveYield).toBeGreaterThan(0);
      
      // With 7% quarterly compounding for 5 years, should be around 141,478
      expectCloseTo(result.maturityAmount, 141478, 0);
    });

    test('should calculate FD with different principal amounts', () => {
      const testCases = [
        { principal: 50000, expectedMaturity: 70739 },
        { principal: 200000, expectedMaturity: 282956 },
        { principal: 500000, expectedMaturity: 707390 },
      ];

      testCases.forEach(({ principal, expectedMaturity }) => {
        const inputs = createFDInputs({ 
          principal,
          annualRate: 7,
          years: 5,
          compoundingFrequency: 'quarterly' 
        });
        const result = calculateFD(inputs);
        
        expectCloseTo(result.maturityAmount, expectedMaturity, 0);
        expect(result.principal).toBe(principal);
        expect(result.totalInterest).toBeGreaterThan(0);
      });
    });

    test('should calculate FD with different interest rates', () => {
      const testCases = [
        { annualRate: 5, expectedMaturity: 128402 },
        { annualRate: 7, expectedMaturity: 141478 },
        { annualRate: 9, expectedMaturity: 155797 },
        { annualRate: 12, expectedMaturity: 181136 },
      ];

      testCases.forEach(({ annualRate, expectedMaturity }) => {
        const inputs = createFDInputs({ 
          principal: 100000,
          annualRate,
          years: 5,
          compoundingFrequency: 'quarterly' 
        });
        const result = calculateFD(inputs);
        
        expectCloseTo(result.maturityAmount, expectedMaturity, 0);
        expect(result.principal).toBe(100000);
      });
    });

    test('should calculate FD with different time periods', () => {
      const testCases = [
        { years: 1, expectedMaturity: 107186 },
        { years: 3, expectedMaturity: 123144 },
        { years: 5, expectedMaturity: 141478 },
        { years: 10, expectedMaturity: 200160 },
      ];

      testCases.forEach(({ years, expectedMaturity }) => {
        const inputs = createFDInputs({ 
          principal: 100000,
          annualRate: 7,
          years,
          compoundingFrequency: 'quarterly' 
        });
        const result = calculateFD(inputs);
        
        expectCloseTo(result.maturityAmount, expectedMaturity, 0);
        expect(result.principal).toBe(100000);
      });
    });
  });

  describe('🔄 Compounding Frequency Tests', () => {
    
    test('should handle yearly compounding', () => {
      const inputs = createFDInputs({
        principal: 100000,
        annualRate: 8,
        years: 3,
        compoundingFrequency: 'yearly',
      });

      const result = calculateFD(inputs);

      // Manual calculation: 100000 * (1.08)^3 = 125,971.20
      expectCloseTo(result.maturityAmount, 125971, 0);
      expectCloseTo(result.totalInterest, 25971, 0);
    });

    test('should handle quarterly compounding', () => {
      const inputs = createFDInputs({
        principal: 100000,
        annualRate: 8,
        years: 3,
        compoundingFrequency: 'quarterly',
      });

      const result = calculateFD(inputs);

      // Quarterly compounding: 100000 * (1.02)^12 = 126,824.18
      expectCloseTo(result.maturityAmount, 126824, 0);
      expectCloseTo(result.totalInterest, 26824, 0);
    });

    test('should handle monthly compounding', () => {
      const inputs = createFDInputs({
        principal: 100000,
        annualRate: 8,
        years: 3,
        compoundingFrequency: 'monthly',
      });

      const result = calculateFD(inputs);

      // Monthly compounding: 100000 * (1 + 0.08/12)^36 = 127,024.18
      expectCloseTo(result.maturityAmount, 127024, 0);
      expectCloseTo(result.totalInterest, 27024, 0);
    });

    test('should verify compounding frequency impact', () => {
      const baseInputs = {
        principal: 100000,
        annualRate: 8,
        years: 5,
      };

      const frequencies: FDInputs['compoundingFrequency'][] = ['yearly', 'quarterly', 'monthly'];
      const results = frequencies.map(frequency => ({
        frequency,
        result: calculateFD({ ...baseInputs, compoundingFrequency: frequency })
      }));

      // More frequent compounding should yield higher returns
      for (let i = 1; i < results.length; i++) {
        expect(results[i].result.maturityAmount).toBeGreaterThan(
          results[i - 1].result.maturityAmount
        );
      }

      // Monthly compounding should be highest
      const monthlyResult = results.find(r => r.frequency === 'monthly')!.result;
      expect(monthlyResult.maturityAmount).toBeGreaterThan(148000);
    });

    test('should calculate effective yield correctly for different frequencies', () => {
      const testCases = [
        { frequency: 'yearly' as const, expectedYield: 46.93 },
        { frequency: 'quarterly' as const, expectedYield: 48.89 },
        { frequency: 'monthly' as const, expectedYield: 49.18 },
      ];

      testCases.forEach(({ frequency, expectedYield }) => {
        const inputs = createFDInputs({
          principal: 100000,
          annualRate: 8,
          years: 5,
          compoundingFrequency: frequency,
        });
        const result = calculateFD(inputs);
        
        expectCloseTo(result.effectiveYield, expectedYield, 1);
      });
    });
  });

  describe('📊 Effective Yield Tests', () => {
    
    test('should calculate effective yield correctly', () => {
      const inputs = createFDInputs({
        principal: 100000,
        annualRate: 6,
        years: 10,
        compoundingFrequency: 'quarterly',
      });

      const result = calculateFD(inputs);

      // Effective yield should be (maturity/principal - 1) * 100
      const expectedYield = (result.maturityAmount / result.principal - 1) * 100;
      expectCloseTo(result.effectiveYield, expectedYield, 2);
    });

    test('should verify effective yield for different scenarios', () => {
      const testCases = [
        { principal: 50000, rate: 5, years: 3, expectedYieldRange: [15, 17] },
        { principal: 100000, rate: 8, years: 5, expectedYieldRange: [45, 50] },
        { principal: 200000, rate: 10, years: 7, expectedYieldRange: [90, 100] },
      ];

      testCases.forEach(({ principal, rate, years, expectedYieldRange }) => {
        const inputs = createFDInputs({
          principal,
          annualRate: rate,
          years,
          compoundingFrequency: 'quarterly',
        });
        const result = calculateFD(inputs);
        
        expect(result.effectiveYield).toBeGreaterThanOrEqual(expectedYieldRange[0]);
        expect(result.effectiveYield).toBeLessThanOrEqual(expectedYieldRange[1]);
      });
    });

    test('should handle zero effective yield', () => {
      const inputs = createFDInputs({
        principal: 100000,
        annualRate: 0,
        years: 5,
        compoundingFrequency: 'quarterly',
      });

      const result = calculateFD(inputs);

      expect(result.effectiveYield).toBe(0);
      expect(result.maturityAmount).toBe(result.principal);
      expect(result.totalInterest).toBe(0);
    });
  });

  describe('🔥 Edge Cases & Boundary Tests', () => {
    
    test('should handle zero principal', () => {
      const inputs = createFDInputs({
        principal: 0,
        annualRate: 7,
        years: 5,
        compoundingFrequency: 'quarterly',
      });

      const result = calculateFD(inputs);

      expect(result.principal).toBe(0);
      expect(result.maturityAmount).toBe(0);
      expect(result.totalInterest).toBe(0);
      expect(result.effectiveYield).toBe(0);
    });

    test('should handle zero interest rate', () => {
      const inputs = createFDInputs({
        principal: 100000,
        annualRate: 0,
        years: 5,
        compoundingFrequency: 'quarterly',
      });

      const result = calculateFD(inputs);

      expect(result.principal).toBe(100000);
      expect(result.maturityAmount).toBe(100000);
      expect(result.totalInterest).toBe(0);
      expect(result.effectiveYield).toBe(0);
    });

    test('should handle very high interest rates', () => {
      const inputs = createFDInputs({
        principal: 100000,
        annualRate: 50, // 50% interest rate
        years: 5,
        compoundingFrequency: 'quarterly',
      });

      const result = calculateFD(inputs);

      expect(result.maturityAmount).toBeGreaterThan(1000000); // Should be over 10 lakhs
      expect(result.totalInterest).toBeGreaterThan(900000);
      expect(result.effectiveYield).toBeGreaterThan(900);
    });

    test('should handle very short periods', () => {
      const inputs = createFDInputs({
        principal: 100000,
        annualRate: 8,
        years: 0.25, // 3 months
        compoundingFrequency: 'monthly',
      });

      const result = calculateFD(inputs);

      expect(result.maturityAmount).toBeGreaterThan(100000);
      expect(result.maturityAmount).toBeLessThan(105000);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.totalInterest).toBeLessThan(5000);
    });

    test('should handle very long periods', () => {
      const inputs = createFDInputs({
        principal: 100000,
        annualRate: 7,
        years: 30, // 30 years
        compoundingFrequency: 'quarterly',
      });

      const result = calculateFD(inputs);

      expect(result.maturityAmount).toBeGreaterThan(700000); // Should be over 7 lakhs
      expect(result.totalInterest).toBeGreaterThan(600000);
      expect(result.effectiveYield).toBeGreaterThan(600);
    });

    test('should handle very small principal amounts', () => {
      const inputs = createFDInputs({
        principal: 1000, // ₹1,000
        annualRate: 7,
        years: 5,
        compoundingFrequency: 'quarterly',
      });

      const result = calculateFD(inputs);

      expect(result.principal).toBe(1000);
      expect(result.maturityAmount).toBeGreaterThan(1000);
      expect(result.maturityAmount).toBeLessThan(1500);
      expect(result.totalInterest).toBeGreaterThan(0);
    });

    test('should handle very large principal amounts', () => {
      const inputs = createFDInputs({
        principal: 10000000, // 1 crore
        annualRate: 7,
        years: 5,
        compoundingFrequency: 'quarterly',
      });

      const result = calculateFD(inputs);

      expect(result.principal).toBe(10000000);
      expect(result.maturityAmount).toBeGreaterThan(14000000); // Should be over 1.4 crores
      expect(result.totalInterest).toBeGreaterThan(4000000);
    });

    test('should handle fractional years', () => {
      const inputs = createFDInputs({
        principal: 100000,
        annualRate: 8,
        years: 2.5, // 2.5 years
        compoundingFrequency: 'quarterly',
      });

      const result = calculateFD(inputs);

      expect(result).toBeDefined();
      expect(result.maturityAmount).toBeGreaterThan(100000);
      expect(result.maturityAmount).toBeLessThan(130000);
    });

    test('should handle fractional interest rates', () => {
      const inputs = createFDInputs({
        principal: 100000,
        annualRate: 7.25, // 7.25% interest
        years: 5,
        compoundingFrequency: 'quarterly',
      });

      const result = calculateFD(inputs);

      expect(result).toBeDefined();
      expect(result.maturityAmount).toBeGreaterThan(140000);
      expect(result.totalInterest).toBeGreaterThan(40000);
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
        const inputs = createFDInputs({ principal: principal as any });
        const result = calculateFD(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.principal).toBe('number');
        expect(typeof result.maturityAmount).toBe('number');
        expect(isFinite(result.principal)).toBe(true);
        expect(isFinite(result.maturityAmount)).toBe(true);
      });
    });

    test('should handle invalid annual rate inputs', () => {
      const testCases = [
        { annualRate: null },
        { annualRate: undefined },
        { annualRate: '' },
        { annualRate: 'invalid' },
        { annualRate: -7 }, // Negative rate
      ];

      testCases.forEach(({ annualRate }) => {
        const inputs = createFDInputs({ annualRate: annualRate as any });
        const result = calculateFD(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.maturityAmount).toBe('number');
        expect(isFinite(result.maturityAmount)).toBe(true);
      });
    });

    test('should handle invalid years inputs', () => {
      const testCases = [
        { years: null },
        { years: undefined },
        { years: '' },
        { years: 'invalid' },
        { years: -5 }, // Negative years
        { years: 0 }, // Zero years
      ];

      testCases.forEach(({ years }) => {
        const inputs = createFDInputs({ years: years as any });
        const result = calculateFD(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.maturityAmount).toBe('number');
        expect(isFinite(result.maturityAmount)).toBe(true);
      });
    });

    test('should handle invalid compounding frequency inputs', () => {
      const testCases = [
        { compoundingFrequency: null },
        { compoundingFrequency: undefined },
        { compoundingFrequency: '' },
        { compoundingFrequency: 'invalid' },
      ];

      testCases.forEach(({ compoundingFrequency }) => {
        const inputs = createFDInputs({ compoundingFrequency: compoundingFrequency as any });
        const result = calculateFD(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.maturityAmount).toBe('number');
        expect(isFinite(result.maturityAmount)).toBe(true);
      });
    });

    test('should handle string inputs with currency symbols', () => {
      const inputs = createFDInputs({
        principal: '₹1,00,000' as any,
        annualRate: '7%' as any,
        years: '5 years' as any,
      });

      const result = calculateFD(inputs);

      expect(result).toBeDefined();
      expect(result.principal).toBeGreaterThan(0);
      expect(result.maturityAmount).toBeGreaterThan(result.principal);
    });

    test('should handle floating point precision issues', () => {
      const inputs = createFDInputs({
        principal: 100000.123456789,
        annualRate: 7.987654321,
        years: 5.123456789,
      });

      const result = calculateFD(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.principal)).toBe(true);
      expect(Number.isFinite(result.maturityAmount)).toBe(true);
      expect(Number.isFinite(result.totalInterest)).toBe(true);
      expect(Number.isFinite(result.effectiveYield)).toBe(true);
    });

    test('should handle very large numbers safely', () => {
      const inputs = createFDInputs({
        principal: 1e10, // Very large principal
        annualRate: 7,
        years: 10,
        compoundingFrequency: 'quarterly',
      });

      const result = calculateFD(inputs);

      expect(result).toBeDefined();
      expect(isFinite(result.principal)).toBe(true);
      expect(isFinite(result.maturityAmount)).toBe(true);
    });
  });

  describe('🧮 Mathematical Accuracy Tests', () => {
    
    test('should verify compound interest formula accuracy', () => {
      const inputs = createFDInputs({
        principal: 100000,
        annualRate: 8,
        years: 3,
        compoundingFrequency: 'quarterly',
      });

      const result = calculateFD(inputs);

      // Manual calculation using compound interest formula
      const P = 100000;
      const r = 0.08;
      const n = 4; // Quarterly
      const t = 3;
      
      const expectedMaturity = P * Math.pow(1 + r/n, n*t);
      
      expectCloseTo(result.maturityAmount, expectedMaturity, 2);
    });

    test('should verify total interest calculation', () => {
      const inputs = createFDInputs({
        principal: 150000,
        annualRate: 6.5,
        years: 4,
        compoundingFrequency: 'monthly',
      });

      const result = calculateFD(inputs);

      // Total interest should equal maturity amount minus principal
      const expectedInterest = result.maturityAmount - result.principal;
      expectCloseTo(result.totalInterest, expectedInterest, 2);
    });

    test('should verify effective yield calculation', () => {
      const inputs = createFDInputs({
        principal: 200000,
        annualRate: 9,
        years: 6,
        compoundingFrequency: 'quarterly',
      });

      const result = calculateFD(inputs);

      // Effective yield should be (maturity/principal - 1) * 100
      const expectedYield = (result.maturityAmount / result.principal - 1) * 100;
      expectCloseTo(result.effectiveYield, expectedYield, 2);
    });

    test('should verify different compounding frequencies mathematically', () => {
      const baseInputs = {
        principal: 100000,
        annualRate: 8,
        years: 2,
      };

      // Test each compounding frequency
      const yearlyResult = calculateFD({ ...baseInputs, compoundingFrequency: 'yearly' });
      const quarterlyResult = calculateFD({ ...baseInputs, compoundingFrequency: 'quarterly' });
      const monthlyResult = calculateFD({ ...baseInputs, compoundingFrequency: 'monthly' });

      // Manual calculations
      const yearlyExpected = 100000 * Math.pow(1.08, 2); // 116,640
      const quarterlyExpected = 100000 * Math.pow(1.02, 8); // 117,166
      const monthlyExpected = 100000 * Math.pow(1 + 0.08/12, 24); // 117,289

      expectCloseTo(yearlyResult.maturityAmount, yearlyExpected, 0);
      expectCloseTo(quarterlyResult.maturityAmount, quarterlyExpected, 0);
      expectCloseTo(monthlyResult.maturityAmount, monthlyExpected, 0);
    });
  });

  describe('⚡ Performance & Stress Tests', () => {
    
    test('should handle multiple calculations efficiently', () => {
      const testCases = Array.from({ length: 1000 }, (_, i) => ({
        principal: 50000 + i * 1000,
        annualRate: 5 + i % 10,
        years: 1 + i % 10,
        compoundingFrequency: ['yearly', 'quarterly', 'monthly'][i % 3] as FDInputs['compoundingFrequency'],
      }));

      const startTime = Date.now();
      
      testCases.forEach(inputs => {
        const result = calculateFD(inputs);
        expect(result).toBeDefined();
        expect(result.maturityAmount).toBeGreaterThan(0);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle large principal calculations efficiently', () => {
      const inputs = createFDInputs({
        principal: 1000000000, // 100 crores
        annualRate: 7,
        years: 10,
        compoundingFrequency: 'monthly',
      });

      const startTime = Date.now();
      const result = calculateFD(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
      expect(result.maturityAmount).toBeGreaterThan(2000000000); // Should be over 200 crores
    });
  });

  describe('🔍 Regression Tests', () => {
    
    test('should maintain consistent results for known scenarios', () => {
      // Known test case with expected results
      const inputs = createFDInputs({
        principal: 100000,
        annualRate: 7,
        years: 5,
        compoundingFrequency: 'quarterly',
      });

      const result = calculateFD(inputs);

      // These values should remain consistent across code changes
      expect(result.principal).toBe(100000);
      expectCloseTo(result.maturityAmount, 141478, 0);
      expectCloseTo(result.totalInterest, 41478, 0);
      expectCloseTo(result.effectiveYield, 41.48, 1);
    });

    test('should handle edge case combinations consistently', () => {
      const edgeCases = [
        { principal: 0, annualRate: 7, years: 5, compoundingFrequency: 'quarterly' as const },
        { principal: 1000000, annualRate: 0, years: 10, compoundingFrequency: 'monthly' as const },
        { principal: 50000, annualRate: 15, years: 1, compoundingFrequency: 'yearly' as const },
      ];

      edgeCases.forEach(inputs => {
        const result = calculateFD(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.principal).toBe('number');
        expect(typeof result.maturityAmount).toBe('number');
        expect(typeof result.totalInterest).toBe('number');
        expect(typeof result.effectiveYield).toBe('number');
        
        expect(isFinite(result.principal)).toBe(true);
        expect(isFinite(result.maturityAmount)).toBe(true);
        expect(isFinite(result.totalInterest)).toBe(true);
        expect(isFinite(result.effectiveYield)).toBe(true);
      });
    });

    test('should verify mathematical relationships', () => {
      const inputs = createFDInputs({
        principal: 250000,
        annualRate: 8.5,
        years: 7,
        compoundingFrequency: 'monthly',
      });

      const result = calculateFD(inputs);

      // Mathematical relationships that should always hold
      expect(result.maturityAmount).toBeGreaterThanOrEqual(result.principal);
      expect(result.totalInterest).toBe(result.maturityAmount - result.principal);
      expect(result.effectiveYield).toBe((result.maturityAmount / result.principal - 1) * 100);
      
      // Logical relationships
      expect(result.totalInterest).toBeGreaterThanOrEqual(0);
      expect(result.effectiveYield).toBeGreaterThanOrEqual(0);
      
      // For positive interest rates and time periods
      if (inputs.annualRate > 0 && inputs.years > 0) {
        expect(result.maturityAmount).toBeGreaterThan(result.principal);
        expect(result.totalInterest).toBeGreaterThan(0);
        expect(result.effectiveYield).toBeGreaterThan(0);
      }
    });
  });
});
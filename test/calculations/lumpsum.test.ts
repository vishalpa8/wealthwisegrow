/**
 * Comprehensive Test Suite for Lumpsum Calculator
 * Tests all edge cases, scenarios, and mathematical accuracy
 * Priority: MEDIUM - Lumpsum investment calculations with compound interest
 */

import { calculateLumpsum } from '../../src/lib/calculations/savings';
import type { LumpsumInputs, LumpsumResults } from '../../src/lib/calculations/savings';

describe('Lumpsum Calculator - Comprehensive Test Suite', () => {
  
  // Helper function to create lumpsum inputs
  const createLumpsumInputs = (overrides: Partial<LumpsumInputs> = {}): LumpsumInputs => ({
    principal: 100000,
    annualReturn: 12,
    years: 10,
    ...overrides,
  });

  // Helper function for precise decimal comparison
  const expectCloseTo = (actual: number, expected: number, precision: number = 2) => {
    expect(actual).toBeCloseTo(expected, precision);
  };

  describe('🎯 Basic Functionality Tests', () => {
    
    test('should calculate standard lumpsum investment correctly', () => {
      const inputs = createLumpsumInputs({
        principal: 100000,
        annualReturn: 12,
        years: 10,
      });

      const result = calculateLumpsum(inputs);

      expect(result.principal).toBe(100000);
      expect(result.maturityAmount).toBeGreaterThan(100000);
      expect(result.totalGains).toBeGreaterThan(0);
      expect(result.totalGains).toBe(result.maturityAmount - result.principal);
      expect(result.yearlyBreakdown).toHaveLength(10);
      
      // With 12% annual return for 10 years: 100000 * (1.12)^10 ≈ 310,585
      expectCloseTo(result.maturityAmount, 310585, 100);
    });

    test('should calculate lumpsum with different principal amounts', () => {
      const testCases = [
        { principal: 50000, expectedMaturity: 155292 },
        { principal: 200000, expectedMaturity: 621169 },
        { principal: 500000, expectedMaturity: 1552923 },
      ];

      testCases.forEach(({ principal, expectedMaturity }) => {
        const inputs = createLumpsumInputs({ 
          principal,
          annualReturn: 12,
          years: 10 
        });
        const result = calculateLumpsum(inputs);
        
        expectCloseTo(result.maturityAmount, expectedMaturity, 1000);
        expect(result.principal).toBe(principal);
        expect(result.totalGains).toBeGreaterThan(0);
      });
    });

    test('should calculate lumpsum with different annual returns', () => {
      const testCases = [
        { annualReturn: 6, expectedMaturity: 179085 },
        { annualReturn: 10, expectedMaturity: 259374 },
        { annualReturn: 12, expectedMaturity: 310585 },
        { annualReturn: 15, expectedMaturity: 404556 },
      ];

      testCases.forEach(({ annualReturn, expectedMaturity }) => {
        const inputs = createLumpsumInputs({ 
          principal: 100000,
          annualReturn,
          years: 10 
        });
        const result = calculateLumpsum(inputs);
        
        expectCloseTo(result.maturityAmount, expectedMaturity, 1000);
        expect(result.principal).toBe(100000);
      });
    });

    test('should calculate lumpsum with different time periods', () => {
      const testCases = [
        { years: 1, expectedMaturity: 112000 },
        { years: 5, expectedMaturity: 176234 },
        { years: 10, expectedMaturity: 310585 },
        { years: 15, expectedMaturity: 547357 },
        { years: 20, expectedMaturity: 964629 },
      ];

      testCases.forEach(({ years, expectedMaturity }) => {
        const inputs = createLumpsumInputs({ 
          principal: 100000,
          annualReturn: 12,
          years 
        });
        const result = calculateLumpsum(inputs);
        
        expectCloseTo(result.maturityAmount, expectedMaturity, 1000);
        expect(result.yearlyBreakdown).toHaveLength(years);
      });
    });
  });

  describe('📊 Yearly Breakdown Accuracy Tests', () => {
    
    test('should generate accurate yearly breakdown', () => {
      const inputs = createLumpsumInputs({
        principal: 50000,
        annualReturn: 10,
        years: 5,
      });

      const result = calculateLumpsum(inputs);

      expect(result.yearlyBreakdown).toHaveLength(5);

      // Check first year
      const year1 = result.yearlyBreakdown[0];
      expect(year1.year).toBe(1);
      expectCloseTo(year1.amount, 55000, 10); // 50000 * 1.10
      expectCloseTo(year1.gains, 5000, 10); // 55000 - 50000

      // Check that amounts increase over time
      for (let i = 1; i < result.yearlyBreakdown.length; i++) {
        expect(result.yearlyBreakdown[i].amount).toBeGreaterThan(
          result.yearlyBreakdown[i - 1].amount
        );
        expect(result.yearlyBreakdown[i].gains).toBeGreaterThan(
          result.yearlyBreakdown[i - 1].gains
        );
      }

      // Final year should match overall results
      const finalYear = result.yearlyBreakdown[result.yearlyBreakdown.length - 1];
      expectCloseTo(finalYear.amount, result.maturityAmount, 2);
      expectCloseTo(finalYear.gains, result.totalGains, 2);
    });

    test('should calculate compound growth correctly each year', () => {
      const inputs = createLumpsumInputs({
        principal: 100000,
        annualReturn: 8,
        years: 3,
      });

      const result = calculateLumpsum(inputs);

      // Manual verification of compound growth
      let expectedAmount = 100000;
      result.yearlyBreakdown.forEach((year, index) => {
        expectedAmount = expectedAmount * 1.08;
        expectCloseTo(year.amount, expectedAmount, 1);
        expectCloseTo(year.gains, expectedAmount - 100000, 1);
        expect(year.year).toBe(index + 1);
      });
    });

    test('should handle zero return rate in yearly breakdown', () => {
      const inputs = createLumpsumInputs({
        principal: 100000,
        annualReturn: 0,
        years: 5,
      });

      const result = calculateLumpsum(inputs);

      // With 0% return, amount should remain constant
      result.yearlyBreakdown.forEach(year => {
        expect(year.amount).toBe(100000);
        expect(year.gains).toBe(0);
      });
    });

    test('should calculate gains correctly in yearly breakdown', () => {
      const inputs = createLumpsumInputs({
        principal: 75000,
        annualReturn: 15,
        years: 4,
      });

      const result = calculateLumpsum(inputs);

      result.yearlyBreakdown.forEach(year => {
        // Gains should always equal amount minus principal
        expectCloseTo(year.gains, year.amount - inputs.principal, 2);
        expect(year.gains).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('🔥 Edge Cases & Boundary Tests', () => {
    
    test('should handle zero principal', () => {
      const inputs = createLumpsumInputs({
        principal: 0,
        annualReturn: 12,
        years: 10,
      });

      const result = calculateLumpsum(inputs);

      expect(result.principal).toBe(0);
      expect(result.maturityAmount).toBe(0);
      expect(result.totalGains).toBe(0);
      expect(result.yearlyBreakdown).toHaveLength(10);
      
      // All yearly values should be zero
      result.yearlyBreakdown.forEach(year => {
        expect(year.amount).toBe(0);
        expect(year.gains).toBe(0);
      });
    });

    test('should handle zero annual return', () => {
      const inputs = createLumpsumInputs({
        principal: 100000,
        annualReturn: 0,
        years: 10,
      });

      const result = calculateLumpsum(inputs);

      expect(result.principal).toBe(100000);
      expect(result.maturityAmount).toBe(100000);
      expect(result.totalGains).toBe(0);
      expect(result.yearlyBreakdown).toHaveLength(10);
      
      // All yearly amounts should equal principal
      result.yearlyBreakdown.forEach(year => {
        expect(year.amount).toBe(100000);
        expect(year.gains).toBe(0);
      });
    });

    test('should handle very high annual returns', () => {
      const inputs = createLumpsumInputs({
        principal: 10000,
        annualReturn: 50, // 50% annual return
        years: 5,
      });

      const result = calculateLumpsum(inputs);

      expect(result.maturityAmount).toBeGreaterThan(75000); // Should be over 7.5x
      expect(result.totalGains).toBeGreaterThan(65000);
      expect(result.totalGains).toBe(result.maturityAmount - result.principal);
    });

    test('should handle very short periods', () => {
      const inputs = createLumpsumInputs({
        principal: 100000,
        annualReturn: 12,
        years: 1,
      });

      const result = calculateLumpsum(inputs);

      expect(result.yearlyBreakdown).toHaveLength(1);
      expectCloseTo(result.maturityAmount, 112000, 10); // 100000 * 1.12
      expectCloseTo(result.totalGains, 12000, 10);
    });

    test('should handle very long periods', () => {
      const inputs = createLumpsumInputs({
        principal: 100000,
        annualReturn: 8,
        years: 50, // 50 years
      });

      const result = calculateLumpsum(inputs);

      expect(result.yearlyBreakdown).toHaveLength(50);
      expect(result.maturityAmount).toBeGreaterThan(4000000); // Should be over 40x
      expect(result.totalGains).toBeGreaterThan(3900000);
    });

    test('should handle very small principal amounts', () => {
      const inputs = createLumpsumInputs({
        principal: 1000,
        annualReturn: 10,
        years: 10,
      });

      const result = calculateLumpsum(inputs);

      expect(result.principal).toBe(1000);
      expect(result.maturityAmount).toBeGreaterThan(2500); // Should be over 2.5x
      expect(result.totalGains).toBeGreaterThan(1500);
    });

    test('should handle very large principal amounts', () => {
      const inputs = createLumpsumInputs({
        principal: 10000000, // 1 crore
        annualReturn: 12,
        years: 10,
      });

      const result = calculateLumpsum(inputs);

      expect(result.principal).toBe(10000000);
      expect(result.maturityAmount).toBeGreaterThan(30000000); // Should be over 3 crores
      expect(result.totalGains).toBeGreaterThan(20000000);
    });

    test('should handle fractional principal amounts', () => {
      const inputs = createLumpsumInputs({
        principal: 123456.78,
        annualReturn: 9.5,
        years: 7,
      });

      const result = calculateLumpsum(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.principal)).toBe(true);
      expect(Number.isFinite(result.maturityAmount)).toBe(true);
      expect(Number.isFinite(result.totalGains)).toBe(true);
    });

    test('should handle fractional annual returns', () => {
      const inputs = createLumpsumInputs({
        principal: 100000,
        annualReturn: 11.75, // 11.75% return
        years: 8,
      });

      const result = calculateLumpsum(inputs);

      expect(result).toBeDefined();
      expect(result.maturityAmount).toBeGreaterThan(result.principal);
      expect(result.totalGains).toBeGreaterThan(0);
    });

    test('should handle fractional years', () => {
      const inputs = createLumpsumInputs({
        principal: 100000,
        annualReturn: 10,
        years: 5.5,
      });

      const result = calculateLumpsum(inputs);

      expect(result.yearlyBreakdown).toHaveLength(5); // Should round down
      expect(result.maturityAmount).toBeGreaterThan(result.principal);
    });

    test('should handle zero years', () => {
      const inputs = createLumpsumInputs({
        principal: 100000,
        annualReturn: 12,
        years: 0,
      });

      const result = calculateLumpsum(inputs);

      expect(result.principal).toBe(100000);
      expect(result.maturityAmount).toBe(100000);
      expect(result.totalGains).toBe(0);
      expect(result.yearlyBreakdown).toHaveLength(0);
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
        const inputs = createLumpsumInputs({ principal: principal as any });
        const result = calculateLumpsum(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.principal).toBe('number');
        expect(typeof result.maturityAmount).toBe('number');
        expect(isFinite(result.principal)).toBe(true);
        expect(isFinite(result.maturityAmount)).toBe(true);
      });
    });

    test('should handle invalid annual return inputs', () => {
      const testCases = [
        { annualReturn: null },
        { annualReturn: undefined },
        { annualReturn: '' },
        { annualReturn: 'invalid' },
        { annualReturn: -12 }, // Negative return
      ];

      testCases.forEach(({ annualReturn }) => {
        const inputs = createLumpsumInputs({ annualReturn: annualReturn as any });
        const result = calculateLumpsum(inputs);
        
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
        { years: -10 }, // Negative years
      ];

      testCases.forEach(({ years }) => {
        const inputs = createLumpsumInputs({ years: years as any });
        const result = calculateLumpsum(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.maturityAmount).toBe('number');
        expect(isFinite(result.maturityAmount)).toBe(true);
      });
    });

    test('should handle string inputs with currency symbols', () => {
      const inputs = createLumpsumInputs({
        principal: '₹1,00,000' as any,
        annualReturn: '12%' as any,
        years: '10 years' as any,
      });

      const result = calculateLumpsum(inputs);

      expect(result).toBeDefined();
      expect(result.principal).toBeGreaterThan(0);
      expect(result.maturityAmount).toBeGreaterThan(result.principal);
    });

    test('should handle floating point precision issues', () => {
      const inputs = createLumpsumInputs({
        principal: 100000.123456789,
        annualReturn: 12.987654321,
        years: 10.123456789,
      });

      const result = calculateLumpsum(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.principal)).toBe(true);
      expect(Number.isFinite(result.maturityAmount)).toBe(true);
      expect(Number.isFinite(result.totalGains)).toBe(true);
    });

    test('should handle very large numbers safely', () => {
      const inputs = createLumpsumInputs({
        principal: 1e10, // Very large principal
        annualReturn: 12,
        years: 20,
      });

      const result = calculateLumpsum(inputs);

      expect(result).toBeDefined();
      expect(isFinite(result.principal)).toBe(true);
      expect(isFinite(result.maturityAmount)).toBe(true);
    });
  });

  describe('🧮 Mathematical Accuracy Tests', () => {
    
    test('should verify compound interest formula accuracy', () => {
      const inputs = createLumpsumInputs({
        principal: 100000,
        annualReturn: 8,
        years: 5,
      });

      const result = calculateLumpsum(inputs);

      // Manual calculation using compound interest formula: P * (1 + r)^t
      const expectedMaturity = 100000 * Math.pow(1.08, 5); // 146,932.81
      
      expectCloseTo(result.maturityAmount, expectedMaturity, 2);
      expectCloseTo(result.totalGains, expectedMaturity - 100000, 2);
    });

    test('should verify yearly breakdown calculations', () => {
      const inputs = createLumpsumInputs({
        principal: 50000,
        annualReturn: 15,
        years: 4,
      });

      const result = calculateLumpsum(inputs);

      // Manual verification of each year
      let expectedAmount = 50000;
      result.yearlyBreakdown.forEach((year, index) => {
        expectedAmount = expectedAmount * 1.15;
        expectCloseTo(year.amount, expectedAmount, 1);
        expectCloseTo(year.gains, expectedAmount - 50000, 1);
        expect(year.year).toBe(index + 1);
      });

      // Final year should match overall result
      const finalYear = result.yearlyBreakdown[result.yearlyBreakdown.length - 1];
      expectCloseTo(finalYear.amount, result.maturityAmount, 2);
    });

    test('should verify total gains calculation', () => {
      const inputs = createLumpsumInputs({
        principal: 200000,
        annualReturn: 10,
        years: 8,
      });

      const result = calculateLumpsum(inputs);

      // Total gains should equal maturity amount minus principal
      const expectedGains = result.maturityAmount - result.principal;
      expectCloseTo(result.totalGains, expectedGains, 2);
    });

    test('should verify mathematical consistency', () => {
      const testCases = [
        { principal: 25000, rate: 6, years: 3 },
        { principal: 150000, rate: 12, years: 7 },
        { principal: 300000, rate: 9, years: 12 },
      ];

      testCases.forEach(({ principal, rate, years }) => {
        const inputs = createLumpsumInputs({ 
          principal, 
          annualReturn: rate, 
          years 
        });
        const result = calculateLumpsum(inputs);
        
        // Basic consistency checks
        expect(result.principal).toBe(principal);
        expect(result.maturityAmount).toBeGreaterThanOrEqual(result.principal);
        expect(result.totalGains).toBe(result.maturityAmount - result.principal);
        expect(result.yearlyBreakdown).toHaveLength(years);
        
        // Verify compound growth
        const expectedMaturity = principal * Math.pow(1 + rate/100, years);
        expectCloseTo(result.maturityAmount, expectedMaturity, 1);
      });
    });
  });

  describe('⚡ Performance & Stress Tests', () => {
    
    test('should handle very long investment periods efficiently', () => {
      const inputs = createLumpsumInputs({
        principal: 100000,
        annualReturn: 8,
        years: 100, // 100 years
      });

      const startTime = Date.now();
      const result = calculateLumpsum(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.yearlyBreakdown).toHaveLength(100);
      expect(result.maturityAmount).toBeGreaterThan(100000000); // Should be over 10 crores
    });

    test('should handle multiple calculations efficiently', () => {
      const testCases = Array.from({ length: 1000 }, (_, i) => ({
        principal: 10000 + i * 1000,
        annualReturn: 5 + i % 15,
        years: 1 + i % 20,
      }));

      const startTime = Date.now();
      
      testCases.forEach(inputs => {
        const result = calculateLumpsum(inputs);
        expect(result).toBeDefined();
        expect(result.maturityAmount).toBeGreaterThan(0);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should handle large principal calculations efficiently', () => {
      const inputs = createLumpsumInputs({
        principal: 1000000000, // 100 crores
        annualReturn: 12,
        years: 20,
      });

      const startTime = Date.now();
      const result = calculateLumpsum(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
      expect(result.maturityAmount).toBeGreaterThan(5000000000); // Should be over 500 crores
    });
  });

  describe('🔍 Regression Tests', () => {
    
    test('should maintain consistent results for known scenarios', () => {
      // Known test case with expected results
      const inputs = createLumpsumInputs({
        principal: 100000,
        annualReturn: 12,
        years: 10,
      });

      const result = calculateLumpsum(inputs);

      // These values should remain consistent across code changes
      expect(result.principal).toBe(100000);
      expectCloseTo(result.maturityAmount, 310585, 100);
      expectCloseTo(result.totalGains, 210585, 100);
      expect(result.yearlyBreakdown).toHaveLength(10);
    });

    test('should handle edge case combinations consistently', () => {
      const edgeCases = [
        { principal: 0, annualReturn: 12, years: 10 },
        { principal: 1000000, annualReturn: 0, years: 20 },
        { principal: 50000, annualReturn: 25, years: 5 },
      ];

      edgeCases.forEach(inputs => {
        const result = calculateLumpsum(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.principal).toBe('number');
        expect(typeof result.maturityAmount).toBe('number');
        expect(typeof result.totalGains).toBe('number');
        expect(Array.isArray(result.yearlyBreakdown)).toBe(true);
        
        expect(isFinite(result.principal)).toBe(true);
        expect(isFinite(result.maturityAmount)).toBe(true);
        expect(isFinite(result.totalGains)).toBe(true);
      });
    });

    test('should verify mathematical relationships', () => {
      const inputs = createLumpsumInputs({
        principal: 250000,
        annualReturn: 9,
        years: 15,
      });

      const result = calculateLumpsum(inputs);

      // Mathematical relationships that should always hold
      expect(result.maturityAmount).toBeGreaterThanOrEqual(result.principal);
      expect(result.totalGains).toBe(result.maturityAmount - result.principal);
      
      // Yearly breakdown should be consistent
      if (result.yearlyBreakdown.length > 0) {
        const finalYear = result.yearlyBreakdown[result.yearlyBreakdown.length - 1];
        expectCloseTo(finalYear.amount, result.maturityAmount, 2);
        expectCloseTo(finalYear.gains, result.totalGains, 2);
      }
      
      // Each year should have consistent calculations
      result.yearlyBreakdown.forEach((year, index) => {
        expect(year.year).toBe(index + 1);
        expect(year.amount).toBeGreaterThanOrEqual(inputs.principal);
        expect(year.gains).toBe(year.amount - inputs.principal);
        expect(year.gains).toBeGreaterThanOrEqual(0);
      });
      
      // Verify compound growth pattern
      for (let i = 1; i < result.yearlyBreakdown.length; i++) {
        const prevYear = result.yearlyBreakdown[i - 1];
        const currentYear = result.yearlyBreakdown[i];
        
        // Current amount should be previous amount * (1 + rate)
        const expectedAmount = prevYear.amount * (1 + inputs.annualReturn / 100);
        expectCloseTo(currentYear.amount, expectedAmount, 1);
      }
    });
  });
});
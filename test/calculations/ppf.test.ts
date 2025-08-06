/**
 * Comprehensive Test Suite for PPF Calculator
 * Tests all edge cases, scenarios, and mathematical accuracy
 * Priority: MEDIUM - Public Provident Fund calculations
 */

import { calculatePPF } from '../../src/lib/calculations/savings';
import type { PPFInputs, PPFResults } from '../../src/lib/calculations/savings';

describe('PPF Calculator - Comprehensive Test Suite', () => {
  
  // Helper function to create PPF inputs
  const createPPFInputs = (overrides: Partial<PPFInputs> = {}): PPFInputs => ({
    yearlyInvestment: 150000,
    years: 15,
    ...overrides,
  });

  // Helper function for precise decimal comparison
  const expectCloseTo = (actual: number, expected: number, precision: number = 2) => {
    expect(actual).toBeCloseTo(expected, precision);
  };

  describe('🎯 Basic Functionality Tests', () => {
    
    test('should calculate standard PPF correctly', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 150000,
        years: 15,
      });

      const result = calculatePPF(inputs);

      expect(result.totalInvestment).toBe(2250000); // 150000 * 15
      expect(result.maturityAmount).toBeGreaterThan(2250000);
      expect(result.totalGains).toBeGreaterThan(0);
      expect(result.totalGains).toBe(result.maturityAmount - result.totalInvestment);
      expect(result.yearlyBreakdown).toHaveLength(15);
      
      // PPF has fixed rate around 7.1%
      expect(result.maturityAmount).toBeGreaterThan(4000000); // Should be over 40 lakhs
    });

    test('should calculate PPF with different yearly investments', () => {
      const testCases = [
        { yearlyInvestment: 50000, expectedTotalInvestment: 750000 },
        { yearlyInvestment: 100000, expectedTotalInvestment: 1500000 },
        { yearlyInvestment: 150000, expectedTotalInvestment: 2250000 },
        { yearlyInvestment: 200000, expectedTotalInvestment: 3000000 },
      ];

      testCases.forEach(({ yearlyInvestment, expectedTotalInvestment }) => {
        const inputs = createPPFInputs({ yearlyInvestment, years: 15 });
        const result = calculatePPF(inputs);
        
        expect(result.totalInvestment).toBe(expectedTotalInvestment);
        expect(result.maturityAmount).toBeGreaterThan(expectedTotalInvestment);
        expect(result.totalGains).toBeGreaterThan(0);
      });
    });

    test('should calculate PPF with different time periods', () => {
      const testCases = [
        { years: 15, expectedMaturityRange: [4000000, 5000000] }, // Minimum PPF period
        { years: 20, expectedMaturityRange: [6000000, 8000000] },
        { years: 25, expectedMaturityRange: [9000000, 12000000] },
        { years: 30, expectedMaturityRange: [13000000, 18000000] },
      ];

      testCases.forEach(({ years, expectedMaturityRange }) => {
        const inputs = createPPFInputs({ 
          yearlyInvestment: 150000,
          years 
        });
        const result = calculatePPF(inputs);
        
        expect(result.maturityAmount).toBeGreaterThanOrEqual(expectedMaturityRange[0]);
        expect(result.maturityAmount).toBeLessThanOrEqual(expectedMaturityRange[1]);
        expect(result.yearlyBreakdown).toHaveLength(years);
      });
    });

    test('should calculate PPF with maximum allowed investment', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 150000, // Current maximum limit
        years: 15,
      });

      const result = calculatePPF(inputs);

      expect(result.totalInvestment).toBe(2250000);
      expect(result.maturityAmount).toBeGreaterThan(4000000);
      expect(result.totalGains).toBeGreaterThan(1500000);
    });
  });

  describe('📊 Yearly Breakdown Accuracy Tests', () => {
    
    test('should generate accurate yearly breakdown', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 100000,
        years: 5, // Short term for easier verification
      });

      const result = calculatePPF(inputs);

      expect(result.yearlyBreakdown).toHaveLength(5);

      // Check first year
      const year1 = result.yearlyBreakdown[0];
      expect(year1.year).toBe(1);
      expect(year1.investment).toBe(100000);
      expect(year1.interest).toBeGreaterThan(0);
      expect(year1.balance).toBeGreaterThan(100000);
      expect(year1.totalInvested).toBe(100000);

      // Check that investments are consistent
      result.yearlyBreakdown.forEach((year, index) => {
        expect(year.year).toBe(index + 1);
        expect(year.investment).toBe(100000);
        expect(year.totalInvested).toBe((index + 1) * 100000);
        expect(year.balance).toBeGreaterThan(year.totalInvested);
        expect(year.interest).toBeGreaterThan(0);
      });

      // Check that balance increases over time
      for (let i = 1; i < result.yearlyBreakdown.length; i++) {
        expect(result.yearlyBreakdown[i].balance).toBeGreaterThan(
          result.yearlyBreakdown[i - 1].balance
        );
      }
    });

    test('should calculate cumulative values correctly', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 120000,
        years: 10,
      });

      const result = calculatePPF(inputs);

      result.yearlyBreakdown.forEach((year, index) => {
        // Total invested should increase by yearly investment each year
        const expectedTotalInvested = (index + 1) * 120000;
        expect(year.totalInvested).toBe(expectedTotalInvested);

        // Balance should be greater than total invested (due to interest)
        expect(year.balance).toBeGreaterThan(year.totalInvested);

        // Interest should be positive
        expect(year.interest).toBeGreaterThan(0);
      });

      // Final year values should match overall results
      const finalYear = result.yearlyBreakdown[result.yearlyBreakdown.length - 1];
      expectCloseTo(finalYear.balance, result.maturityAmount, 2);
      expectCloseTo(finalYear.totalInvested, result.totalInvestment, 2);
    });

    test('should calculate interest correctly each year', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 100000,
        years: 3,
      });

      const result = calculatePPF(inputs);

      const ppfRate = 0.071; // Current PPF rate ~7.1%

      // Verify interest calculation for each year
      let expectedBalance = 0;
      result.yearlyBreakdown.forEach((year, index) => {
        // Add yearly investment and calculate interest
        const expectedInterest = (expectedBalance + year.investment) * ppfRate;
        expectedBalance = expectedBalance + year.investment + expectedInterest;
        
        expectCloseTo(year.interest, expectedInterest, 1);
        expectCloseTo(year.balance, expectedBalance, 1);
      });
    });
  });

  describe('🔥 Edge Cases & Boundary Tests', () => {
    
    test('should handle minimum PPF period (15 years)', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 150000,
        years: 15,
      });

      const result = calculatePPF(inputs);

      expect(result.yearlyBreakdown).toHaveLength(15);
      expect(result.totalInvestment).toBe(2250000);
      expect(result.maturityAmount).toBeGreaterThan(4000000);
    });

    test('should handle extended PPF periods', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 150000,
        years: 30, // Extended period
      });

      const result = calculatePPF(inputs);

      expect(result.yearlyBreakdown).toHaveLength(30);
      expect(result.totalInvestment).toBe(4500000);
      expect(result.maturityAmount).toBeGreaterThan(15000000); // Should be over 1.5 crores
    });

    test('should handle minimum yearly investment', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 500, // Minimum investment
        years: 15,
      });

      const result = calculatePPF(inputs);

      expect(result.totalInvestment).toBe(7500);
      expect(result.maturityAmount).toBeGreaterThan(7500);
      expect(result.totalGains).toBeGreaterThan(0);
    });

    test('should handle maximum yearly investment', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 150000, // Current maximum
        years: 15,
      });

      const result = calculatePPF(inputs);

      expect(result.totalInvestment).toBe(2250000);
      expect(result.maturityAmount).toBeGreaterThan(4000000);
      expect(result.totalGains).toBeGreaterThan(1500000);
    });

    test('should handle zero yearly investment', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 0,
        years: 15,
      });

      const result = calculatePPF(inputs);

      expect(result.totalInvestment).toBe(0);
      expect(result.maturityAmount).toBe(0);
      expect(result.totalGains).toBe(0);
      expect(result.yearlyBreakdown).toHaveLength(15);
      
      // All yearly values should be zero
      result.yearlyBreakdown.forEach(year => {
        expect(year.investment).toBe(0);
        expect(year.interest).toBe(0);
        expect(year.balance).toBe(0);
        expect(year.totalInvested).toBe(0);
      });
    });

    test('should handle very large yearly investments', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 1000000, // Very large investment
        years: 15,
      });

      const result = calculatePPF(inputs);

      expect(result.totalInvestment).toBe(15000000);
      expect(result.maturityAmount).toBeGreaterThan(30000000);
      expect(result.totalGains).toBeGreaterThan(15000000);
    });

    test('should handle very short periods', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 100000,
        years: 1,
      });

      const result = calculatePPF(inputs);

      expect(result.yearlyBreakdown).toHaveLength(1);
      expect(result.totalInvestment).toBe(100000);
      expect(result.maturityAmount).toBeGreaterThan(100000);
      
      const year1 = result.yearlyBreakdown[0];
      expect(year1.investment).toBe(100000);
      expect(year1.interest).toBeGreaterThan(0);
    });

    test('should handle very long periods', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 150000,
        years: 50, // Very long period
      });

      const result = calculatePPF(inputs);

      expect(result.yearlyBreakdown).toHaveLength(50);
      expect(result.totalInvestment).toBe(7500000);
      expect(result.maturityAmount).toBeGreaterThan(50000000); // Should be over 5 crores
    });

    test('should handle fractional yearly investments', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 123456.78,
        years: 15,
      });

      const result = calculatePPF(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.totalInvestment)).toBe(true);
      expect(Number.isFinite(result.maturityAmount)).toBe(true);
      expect(Number.isFinite(result.totalGains)).toBe(true);
    });
  });

  describe('🛡️ Input Validation & Robustness Tests', () => {
    
    test('should handle invalid yearly investment inputs', () => {
      const testCases = [
        { yearlyInvestment: null },
        { yearlyInvestment: undefined },
        { yearlyInvestment: '' },
        { yearlyInvestment: 'invalid' },
        { yearlyInvestment: -150000 }, // Negative investment
      ];

      testCases.forEach(({ yearlyInvestment }) => {
        const inputs = createPPFInputs({ yearlyInvestment: yearlyInvestment as any });
        const result = calculatePPF(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.totalInvestment).toBe('number');
        expect(typeof result.maturityAmount).toBe('number');
        expect(isFinite(result.totalInvestment)).toBe(true);
        expect(isFinite(result.maturityAmount)).toBe(true);
      });
    });

    test('should handle invalid years inputs', () => {
      const testCases = [
        { years: null },
        { years: undefined },
        { years: '' },
        { years: 'invalid' },
        { years: -15 }, // Negative years
        { years: 0 }, // Zero years
      ];

      testCases.forEach(({ years }) => {
        const inputs = createPPFInputs({ years: years as any });
        const result = calculatePPF(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.totalInvestment).toBe('number');
        expect(typeof result.maturityAmount).toBe('number');
        expect(isFinite(result.totalInvestment)).toBe(true);
        expect(isFinite(result.maturityAmount)).toBe(true);
      });
    });

    test('should handle string inputs with currency symbols', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: '₹1,50,000' as any,
        years: '15 years' as any,
      });

      const result = calculatePPF(inputs);

      expect(result).toBeDefined();
      expect(result.totalInvestment).toBeGreaterThan(0);
      expect(result.maturityAmount).toBeGreaterThan(result.totalInvestment);
    });

    test('should handle floating point precision issues', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 150000.123456789,
        years: 15.987654321,
      });

      const result = calculatePPF(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.totalInvestment)).toBe(true);
      expect(Number.isFinite(result.maturityAmount)).toBe(true);
      expect(Number.isFinite(result.totalGains)).toBe(true);
    });

    test('should handle very large numbers safely', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 1e7, // Very large yearly investment
        years: 30,
      });

      const result = calculatePPF(inputs);

      expect(result).toBeDefined();
      expect(isFinite(result.totalInvestment)).toBe(true);
      expect(isFinite(result.maturityAmount)).toBe(true);
    });
  });

  describe('🧮 Mathematical Accuracy Tests', () => {
    
    test('should verify PPF interest calculation accuracy', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 100000,
        years: 3,
      });

      const result = calculatePPF(inputs);

      const ppfRate = 0.071; // Current PPF rate ~7.1%

      // Manual calculation for verification
      let expectedBalance = 0;
      result.yearlyBreakdown.forEach((year, index) => {
        const expectedInterest = (expectedBalance + year.investment) * ppfRate;
        expectedBalance = expectedBalance + year.investment + expectedInterest;
        
        expectCloseTo(year.interest, expectedInterest, 1);
        expectCloseTo(year.balance, expectedBalance, 1);
      });
    });

    test('should verify total investment calculations', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 125000,
        years: 20,
      });

      const result = calculatePPF(inputs);

      // Total investment should equal yearly investment * years
      const expectedTotalInvestment = 125000 * 20;
      expect(result.totalInvestment).toBe(expectedTotalInvestment);

      // Total gains should equal maturity amount minus total investment
      expectCloseTo(result.totalGains, result.maturityAmount - result.totalInvestment, 2);
    });

    test('should verify yearly breakdown calculations', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 150000,
        years: 5,
      });

      const result = calculatePPF(inputs);

      const ppfRate = 0.071;

      // Verify each year's calculation
      let expectedBalance = 0;
      result.yearlyBreakdown.forEach((year, index) => {
        // Add yearly investment and apply interest
        const expectedInterest = (expectedBalance + 150000) * ppfRate;
        expectedBalance = expectedBalance + 150000 + expectedInterest;
        
        expectCloseTo(year.balance, expectedBalance, 1);
        expect(year.totalInvested).toBe((index + 1) * 150000);
        expectCloseTo(year.interest, expectedInterest, 1);
      });
    });

    test('should verify compound growth calculations', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 100000,
        years: 10,
      });

      const result = calculatePPF(inputs);

      // Each year should show compound growth
      const ppfRate = 0.071;
      
      for (let i = 1; i < result.yearlyBreakdown.length; i++) {
        const prevYear = result.yearlyBreakdown[i - 1];
        const currentYear = result.yearlyBreakdown[i];
        
        // Current balance should be (previous balance + investment) * (1 + rate)
        const expectedBalance = (prevYear.balance + 100000) * (1 + ppfRate);
        expectCloseTo(currentYear.balance, expectedBalance, 1);
      }
    });
  });

  describe('⚡ Performance & Stress Tests', () => {
    
    test('should handle very long PPF periods efficiently', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 150000,
        years: 100, // 100 years
      });

      const startTime = Date.now();
      const result = calculatePPF(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.yearlyBreakdown).toHaveLength(100);
      expect(result.maturityAmount).toBeGreaterThan(100000000); // Should be over 10 crores
    });

    test('should handle multiple calculations efficiently', () => {
      const testCases = Array.from({ length: 100 }, (_, i) => ({
        yearlyInvestment: 50000 + i * 1000,
        years: 15 + i % 20,
      }));

      const startTime = Date.now();
      
      testCases.forEach(inputs => {
        const result = calculatePPF(inputs);
        expect(result).toBeDefined();
        expect(result.maturityAmount).toBeGreaterThan(0);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should handle large yearly investments efficiently', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 10000000, // 1 crore per year
        years: 30,
      });

      const startTime = Date.now();
      const result = calculatePPF(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(result.totalInvestment).toBe(300000000); // 30 crores
      expect(result.maturityAmount).toBeGreaterThan(1000000000); // Over 100 crores
    });
  });

  describe('🔍 Regression Tests', () => {
    
    test('should maintain consistent results for known scenarios', () => {
      // Known test case with expected results
      const inputs = createPPFInputs({
        yearlyInvestment: 150000,
        years: 15,
      });

      const result = calculatePPF(inputs);

      // These values should remain consistent across code changes
      expect(result.totalInvestment).toBe(2250000);
      expect(result.maturityAmount).toBeGreaterThan(4000000);
      expect(result.maturityAmount).toBeLessThan(5000000);
      expect(result.totalGains).toBeGreaterThan(1500000);
      expect(result.yearlyBreakdown).toHaveLength(15);
    });

    test('should handle edge case combinations consistently', () => {
      const edgeCases = [
        { yearlyInvestment: 0, years: 15 },
        { yearlyInvestment: 1000000, years: 1 },
        { yearlyInvestment: 150000, years: 50 },
      ];

      edgeCases.forEach(inputs => {
        const result = calculatePPF(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.totalInvestment).toBe('number');
        expect(typeof result.maturityAmount).toBe('number');
        expect(typeof result.totalGains).toBe('number');
        expect(Array.isArray(result.yearlyBreakdown)).toBe(true);
        
        expect(isFinite(result.totalInvestment)).toBe(true);
        expect(isFinite(result.maturityAmount)).toBe(true);
        expect(isFinite(result.totalGains)).toBe(true);
      });
    });

    test('should verify mathematical relationships', () => {
      const inputs = createPPFInputs({
        yearlyInvestment: 120000,
        years: 20,
      });

      const result = calculatePPF(inputs);

      // Mathematical relationships that should always hold
      expect(result.maturityAmount).toBeGreaterThanOrEqual(result.totalInvestment);
      expect(result.totalGains).toBe(result.maturityAmount - result.totalInvestment);
      expect(result.totalInvestment).toBe(inputs.yearlyInvestment * inputs.years);
      
      // Yearly breakdown should be consistent
      if (result.yearlyBreakdown.length > 0) {
        const finalYear = result.yearlyBreakdown[result.yearlyBreakdown.length - 1];
        expectCloseTo(finalYear.balance, result.maturityAmount, 2);
        expectCloseTo(finalYear.totalInvested, result.totalInvestment, 2);
      }
      
      // Each year should have consistent calculations
      result.yearlyBreakdown.forEach((year, index) => {
        expect(year.year).toBe(index + 1);
        expect(year.investment).toBe(inputs.yearlyInvestment);
        expect(year.totalInvested).toBe((index + 1) * inputs.yearlyInvestment);
        expect(year.balance).toBeGreaterThanOrEqual(year.totalInvested);
        expect(year.interest).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
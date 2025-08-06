/**
 * Comprehensive Test Suite for SIP Calculator
 * Tests all edge cases, scenarios, and mathematical accuracy
 * Priority: HIGH - Systematic Investment Plan calculations
 */

import { calculateSIP } from '../../src/lib/calculations/savings';
import type { SIPInputs, SIPResults } from '../../src/lib/calculations/savings';

describe('SIP Calculator - Comprehensive Test Suite', () => {
  
  // Helper function to create SIP inputs
  const createSIPInputs = (overrides: Partial<SIPInputs> = {}): SIPInputs => ({
    monthlyInvestment: 5000,
    annualReturn: 12,
    years: 10,
    ...overrides,
  });

  // Helper function for precise decimal comparison
  const expectCloseTo = (actual: number, expected: number, precision: number = 2) => {
    expect(actual).toBeCloseTo(expected, precision);
  };

  describe('🎯 Basic Functionality Tests', () => {
    
    test('should calculate standard SIP correctly', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: 5000,
        annualReturn: 12,
        years: 10,
      });

      const result = calculateSIP(inputs);

      expect(result.totalInvestment).toBe(600000); // 5000 * 12 * 10
      expect(result.maturityAmount).toBeGreaterThan(600000);
      expect(result.totalGains).toBeGreaterThan(0);
      expect(result.totalGains).toBeCloseTo(result.maturityAmount - result.totalInvestment, 2);
      expect(result.monthlyBreakdown).toHaveLength(120); // 10 years * 12 months
      expect(result.error).toBeUndefined();
    });

    test('should calculate SIP with different monthly investments', () => {
      const testCases = [
        { monthlyInvestment: 1000, expectedTotalInvestment: 120000 },
        { monthlyInvestment: 10000, expectedTotalInvestment: 1200000 },
        { monthlyInvestment: 25000, expectedTotalInvestment: 3000000 },
      ];

      testCases.forEach(({ monthlyInvestment, expectedTotalInvestment }) => {
        const inputs = createSIPInputs({ monthlyInvestment, annualReturn: 12, years: 10 });
        const result = calculateSIP(inputs);
        
        expect(result.totalInvestment).toBe(expectedTotalInvestment);
        expect(result.maturityAmount).toBeGreaterThan(expectedTotalInvestment);
        expect(result.totalGains).toBeGreaterThan(0);
      });
    });

    test('should calculate SIP with different annual returns', () => {
      const testCases = [
        { annualReturn: 6, expectedGainsRange: [100000, 250000] },
        { annualReturn: 12, expectedGainsRange: [500000, 700000] },
        { annualReturn: 18, expectedGainsRange: [900000, 1200000] },
      ];

      testCases.forEach(({ annualReturn, expectedGainsRange }) => {
        const inputs = createSIPInputs({ 
          monthlyInvestment: 5000,
          annualReturn,
          years: 10 
        });
        const result = calculateSIP(inputs);
        
        expect(result.totalGains).toBeGreaterThanOrEqual(expectedGainsRange[0]);
        expect(result.totalGains).toBeLessThanOrEqual(expectedGainsRange[1]);
      });
    });

    test('should calculate SIP with different time periods', () => {
      const testCases = [
        { years: 1, expectedMaturityRange: [60000, 70000] },
        { years: 5, expectedMaturityRange: [350000, 450000] },
        { years: 15, expectedMaturityRange: [1500000, 2700000] },
        { years: 20, expectedMaturityRange: [3000000, 5000000] },
      ];

      testCases.forEach(({ years, expectedMaturityRange }) => {
        const inputs = createSIPInputs({ 
          monthlyInvestment: 5000,
          annualReturn: 12,
          years 
        });
        const result = calculateSIP(inputs);
        
        expect(result.maturityAmount).toBeGreaterThanOrEqual(expectedMaturityRange[0]);
        expect(result.maturityAmount).toBeLessThanOrEqual(expectedMaturityRange[1]);
        expect(result.monthlyBreakdown).toHaveLength(years * 12);
      });
    });
  });

  describe('📊 Monthly Breakdown Accuracy Tests', () => {
    
    test('should generate accurate monthly breakdown', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: 10000,
        annualReturn: 12,
        years: 2, // Short term for easier verification
      });

      const result = calculateSIP(inputs);

      expect(result.monthlyBreakdown).toHaveLength(24);

      // Check first month
      const firstMonth = result.monthlyBreakdown[0];
      expect(firstMonth.month).toBe(1);
      expect(firstMonth.investment).toBe(10000);
      expect(firstMonth.totalInvested).toBe(10000);
      expect(firstMonth.balance).toBeGreaterThan(10000);
      expect(firstMonth.totalGains).toBeGreaterThan(0);

      // Check that investments are consistent
      result.monthlyBreakdown.forEach((month, index) => {
        expect(month.month).toBe(index + 1);
        expect(month.investment).toBe(10000);
        expect(month.totalInvested).toBe((index + 1) * 10000);
        expect(month.balance).toBeGreaterThan(month.totalInvested);
        expect(month.totalGains).toBeCloseTo(month.balance - month.totalInvested, 2);
      });

      // Check that balance increases over time
      for (let i = 1; i < result.monthlyBreakdown.length; i++) {
        expect(result.monthlyBreakdown[i].balance).toBeGreaterThan(
          result.monthlyBreakdown[i - 1].balance
        );
      }
    });

    test('should calculate cumulative values correctly', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: 5000,
        annualReturn: 10,
        years: 3,
      });

      const result = calculateSIP(inputs);

      result.monthlyBreakdown.forEach((month, index) => {
        // Total invested should increase by monthly investment each month
        const expectedTotalInvested = (index + 1) * 5000;
        expect(month.totalInvested).toBe(expectedTotalInvested);

        // Total gains should equal balance minus total invested
        expectCloseTo(month.totalGains, month.balance - month.totalInvested, 2);

        // Balance should be greater than total invested (assuming positive returns)
        expect(month.balance).toBeGreaterThan(month.totalInvested);
      });

      // Final month values should match overall results
      const finalMonth = result.monthlyBreakdown[result.monthlyBreakdown.length - 1];
      expectCloseTo(finalMonth.balance, result.maturityAmount, 2);
      expectCloseTo(finalMonth.totalInvested, result.totalInvestment, 2);
      expectCloseTo(finalMonth.totalGains, result.totalGains, 2);
    });
  });

  describe('🔥 Edge Cases & Boundary Tests', () => {
    
    test('should handle zero monthly investment', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: 0,
        annualReturn: 12,
        years: 10,
      });

      const result = calculateSIP(inputs);

      expect(result.totalInvestment).toBe(0);
      expect(result.maturityAmount).toBe(0);
      expect(result.totalGains).toBe(0);
      expect(result.monthlyBreakdown).toHaveLength(0);
      expect(result.error).toBeUndefined();
    });

    test('should handle zero annual return', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: 5000,
        annualReturn: 0,
        years: 5,
      });

      const result = calculateSIP(inputs);

      expect(result.totalInvestment).toBe(300000); // 5000 * 12 * 5
      expectCloseTo(result.maturityAmount, 300000, 2); // No growth with 0% return
      expectCloseTo(result.totalGains, 0, 2);
      expect(result.monthlyBreakdown).toHaveLength(60);
    });

    test('should handle very high annual returns', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: 1000,
        annualReturn: 50, // 50% annual return
        years: 5,
      });

      const result = calculateSIP(inputs);

      expect(result.totalInvestment).toBe(60000);
      expect(result.maturityAmount).toBeGreaterThan(200000);
      expect(result.totalGains).toBeGreaterThan(result.totalInvestment);
    });

    test('should handle very short investment periods', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: 10000,
        annualReturn: 12,
        years: 1,
      });

      const result = calculateSIP(inputs);

      expect(result.monthlyBreakdown).toHaveLength(12);
      expect(result.totalInvestment).toBe(120000);
      expect(result.maturityAmount).toBeGreaterThan(120000);
    });

    test('should handle very long investment periods', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: 5000,
        annualReturn: 12,
        years: 30,
      });

      const result = calculateSIP(inputs);

      expect(result.monthlyBreakdown).toHaveLength(360);
      expect(result.totalInvestment).toBe(1800000); // 5000 * 12 * 30
      expect(result.maturityAmount).toBeGreaterThan(10000000); // Should be over 1 crore
    });

    test('should handle very small monthly investments', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: 100,
        annualReturn: 12,
        years: 10,
      });

      const result = calculateSIP(inputs);

      expect(result.totalInvestment).toBe(12000);
      expect(result.maturityAmount).toBeGreaterThan(12000);
      expect(result.totalGains).toBeGreaterThan(0);
    });

    test('should handle very large monthly investments', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: 100000,
        annualReturn: 12,
        years: 10,
      });

      const result = calculateSIP(inputs);

      expect(result.totalInvestment).toBe(12000000);
      expect(result.maturityAmount).toBeGreaterThan(20000000);
      expect(result.totalGains).toBeGreaterThan(8000000);
    });

    test('should handle fractional years', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: 5000,
        annualReturn: 12,
        years: 2.5,
      });

      const result = calculateSIP(inputs);

      expect(result.monthlyBreakdown).toHaveLength(30); // 2.5 * 12 = 30 months
      expect(result.totalInvestment).toBe(150000);
      expect(result.maturityAmount).toBeGreaterThan(150000);
    });

    test('should handle maximum investment period limit', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: 1000,
        annualReturn: 12,
        years: 100, // Very long period
      });

      const result = calculateSIP(inputs);

      // Should handle gracefully without infinite loops
      expect(result).toBeDefined();
      expect(result.monthlyBreakdown.length).toBeLessThanOrEqual(1200); // Max 100 years
    });
  });

  describe('🛡️ Input Validation & Robustness Tests', () => {
    
    test('should handle invalid monthly investment inputs', () => {
      const testCases = [
        { monthlyInvestment: null },
        { monthlyInvestment: undefined },
        { monthlyInvestment: '' },
        { monthlyInvestment: 'invalid' },
        { monthlyInvestment: -5000 }, // Negative amount
      ];

      testCases.forEach(({ monthlyInvestment }) => {
        const inputs = createSIPInputs({ monthlyInvestment: monthlyInvestment as any });
        const result = calculateSIP(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.totalInvestment).toBe('number');
        expect(typeof result.maturityAmount).toBe('number');
        expect(isFinite(result.totalInvestment)).toBe(true);
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
        const inputs = createSIPInputs({ annualReturn: annualReturn as any });
        const result = calculateSIP(inputs);
        
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
        { years: -10 }, // Negative years
        { years: 0 }, // Zero years
      ];

      testCases.forEach(({ years }) => {
        const inputs = createSIPInputs({ years: years as any });
        const result = calculateSIP(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.totalInvestment).toBe('number');
        expect(typeof result.maturityAmount).toBe('number');
        expect(isFinite(result.totalInvestment)).toBe(true);
        expect(isFinite(result.maturityAmount)).toBe(true);
      });
    });

    test('should handle string inputs with symbols', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: '₹5,000' as any,
        annualReturn: '12%' as any,
        years: '10 years' as any,
      });

      const result = calculateSIP(inputs);

      expect(result).toBeDefined();
      expect(result.totalInvestment).toBeGreaterThan(0);
      expect(result.maturityAmount).toBeGreaterThan(result.totalInvestment);
    });

    test('should handle floating point precision issues', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: 5000.123456789,
        annualReturn: 12.987654321,
        years: 10.123456789,
      });

      const result = calculateSIP(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.totalInvestment)).toBe(true);
      expect(Number.isFinite(result.maturityAmount)).toBe(true);
      expect(Number.isFinite(result.totalGains)).toBe(true);
    });

    test('should handle very large numbers safely', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: 1e6, // Very large monthly investment
        annualReturn: 12,
        years: 30,
      });

      const result = calculateSIP(inputs);

      expect(result).toBeDefined();
      expect(isFinite(result.totalInvestment)).toBe(true);
      expect(isFinite(result.maturityAmount)).toBe(true);
    });
  });

  describe('🧮 Mathematical Accuracy Tests', () => {
    
    test('should verify SIP formula accuracy', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: 10000,
        annualReturn: 12,
        years: 5,
      });

      const result = calculateSIP(inputs);

      // Manual calculation using SIP formula
      const P = 10000; // Monthly investment
      const r = 0.12 / 12; // Monthly rate
      const n = 5 * 12; // Number of months
      
      // SIP formula: P * [((1 + r)^n - 1) / r] * (1 + r)
      const expectedMaturity = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
      
      expectCloseTo(result.maturityAmount, expectedMaturity, 0);
    });

    test('should verify total investment calculations', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: 7500,
        annualReturn: 15,
        years: 8,
      });

      const result = calculateSIP(inputs);

      // Total investment should equal monthly investment * months
      const expectedTotalInvestment = 7500 * 8 * 12;
      expect(result.totalInvestment).toBe(expectedTotalInvestment);

      // Total gains should equal maturity amount minus total investment
      expectCloseTo(result.totalGains, result.maturityAmount - result.totalInvestment, 2);
    });

    test('should verify monthly breakdown calculations', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: 5000,
        annualReturn: 10,
        years: 3,
      });

      const result = calculateSIP(inputs);

      const monthlyRate = 0.10 / 12;

      // Verify each month's calculation
      let expectedBalance = 0;
      result.monthlyBreakdown.forEach((month, index) => {
        // Add monthly investment and apply growth
        expectedBalance = (expectedBalance + 5000) * (1 + monthlyRate);
        
        expectCloseTo(month.balance, expectedBalance, 1);
        expect(month.totalInvested).toBe((index + 1) * 5000);
        expectCloseTo(month.totalGains, expectedBalance - month.totalInvested, 1);
      });
    });

    test('should verify compound growth calculations', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: 1000,
        annualReturn: 12,
        years: 2,
      });

      const result = calculateSIP(inputs);

      // Each month should show compound growth
      const monthlyRate = 0.12 / 12;
      
      for (let i = 1; i < result.monthlyBreakdown.length; i++) {
        const prevMonth = result.monthlyBreakdown[i - 1];
        const currentMonth = result.monthlyBreakdown[i];
        
        // Current balance should be (previous balance + investment) * (1 + rate)
        const expectedBalance = (prevMonth.balance + 1000) * (1 + monthlyRate);
        expectCloseTo(currentMonth.balance, expectedBalance, 1);
      }
    });
  });

  describe('⚡ Performance & Stress Tests', () => {
    
    test('should handle very long SIP periods efficiently', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: 10000,
        annualReturn: 12,
        years: 50, // 50 years = 600 months
      });

      const startTime = Date.now();
      const result = calculateSIP(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.monthlyBreakdown).toHaveLength(600);
      expect(result.maturityAmount).toBeGreaterThan(50000000);
    });

    test('should handle multiple calculations efficiently', () => {
      const testCases = Array.from({ length: 100 }, (_, i) => ({
        monthlyInvestment: 1000 + i * 100,
        annualReturn: 8 + i * 0.1,
        years: 5 + i * 0.1,
      }));

      const startTime = Date.now();
      
      testCases.forEach(inputs => {
        const result = calculateSIP(inputs);
        expect(result).toBeDefined();
        expect(result.maturityAmount).toBeGreaterThan(0);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should handle large monthly investments efficiently', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: 500000, // 5 lakh per month
        annualReturn: 15,
        years: 20,
      });

      const startTime = Date.now();
      const result = calculateSIP(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(result.totalInvestment).toBe(120000000); // 12 crores
      expect(result.maturityAmount).toBeGreaterThan(500000000); // Over 50 crores
    });
  });

  describe('🔍 Regression Tests', () => {
    
    test('should maintain consistent results for known scenarios', () => {
      // Known test case with expected results
      const inputs = createSIPInputs({
        monthlyInvestment: 10000,
        annualReturn: 12,
        years: 15,
      });

      const result = calculateSIP(inputs);

      // These values should remain consistent across code changes
      expect(result.totalInvestment).toBe(1800000); // 10000 * 12 * 15
      expect(result.maturityAmount).toBeGreaterThan(5000000);
      expect(result.maturityAmount).toBeLessThan(6000000);
      expect(result.totalGains).toBeGreaterThan(3000000);
      expect(result.monthlyBreakdown).toHaveLength(180);
    });

    test('should handle edge case combinations consistently', () => {
      const edgeCases = [
        { monthlyInvestment: 0, annualReturn: 12, years: 10 },
        { monthlyInvestment: 1000000, annualReturn: 0, years: 1 },
        { monthlyInvestment: 5000, annualReturn: 50, years: 30 },
      ];

      edgeCases.forEach(inputs => {
        const result = calculateSIP(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.totalInvestment).toBe('number');
        expect(typeof result.maturityAmount).toBe('number');
        expect(typeof result.totalGains).toBe('number');
        expect(Array.isArray(result.monthlyBreakdown)).toBe(true);
        
        expect(isFinite(result.totalInvestment)).toBe(true);
        expect(isFinite(result.maturityAmount)).toBe(true);
        expect(isFinite(result.totalGains)).toBe(true);
      });
    });

    test('should verify mathematical relationships', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: 8000,
        annualReturn: 14,
        years: 12,
      });

      const result = calculateSIP(inputs);

      // Mathematical relationships that should always hold
      expect(result.maturityAmount).toBeGreaterThanOrEqual(result.totalInvestment);
      expect(result.totalGains).toBe(result.maturityAmount - result.totalInvestment);
      expect(result.totalInvestment).toBe(inputs.monthlyInvestment * 12 * inputs.years);
      
      // Monthly breakdown should be consistent
      if (result.monthlyBreakdown.length > 0) {
        const finalMonth = result.monthlyBreakdown[result.monthlyBreakdown.length - 1];
        expectCloseTo(finalMonth.balance, result.maturityAmount, 2);
        expectCloseTo(finalMonth.totalInvested, result.totalInvestment, 2);
        expectCloseTo(finalMonth.totalGains, result.totalGains, 2);
      }
      
      // Each month should have consistent calculations
      result.monthlyBreakdown.forEach((month, index) => {
        expect(month.month).toBe(index + 1);
        expect(month.investment).toBe(inputs.monthlyInvestment);
        expect(month.totalInvested).toBe((index + 1) * inputs.monthlyInvestment);
        expect(month.totalGains).toBeCloseTo(month.balance - month.totalInvested, 2);
      });
    });

    test('should handle error conditions gracefully', () => {
      const inputs = createSIPInputs({
        monthlyInvestment: 1000,
        annualReturn: 12,
        years: 200, // Extremely long period that might cause errors
      });

      const result = calculateSIP(inputs);

      // Should either calculate successfully or return error gracefully
      expect(result).toBeDefined();
      if (result.error) {
        expect(typeof result.error).toBe('string');
        expect(result.totalInvestment).toBe(0);
        expect(result.maturityAmount).toBe(0);
        expect(result.totalGains).toBe(0);
      } else {
        expect(result.totalInvestment).toBeGreaterThan(0);
        expect(result.maturityAmount).toBeGreaterThan(0);
      }
    });
  });
});
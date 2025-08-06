/**
 * Comprehensive Test Suite for RD Calculator
 * Tests all edge cases, scenarios, and mathematical accuracy
 * Priority: MEDIUM - Recurring Deposit calculations with monthly breakdowns
 */

import { calculateRD } from '../../src/lib/calculations/savings';
import type { RDInputs, RDResults } from '../../src/lib/calculations/savings';

describe('RD Calculator - Comprehensive Test Suite', () => {
  
  // Helper function to create RD inputs
  const createRDInputs = (overrides: Partial<RDInputs> = {}): RDInputs => ({
    monthlyDeposit: 5000,
    annualRate: 7,
    years: 5,
    ...overrides,
  });

  // Helper function for precise decimal comparison
  const expectCloseTo = (actual: number, expected: number, precision: number = 2) => {
    expect(actual).toBeCloseTo(expected, precision);
  };

  describe('🎯 Basic Functionality Tests', () => {
    
    test('should calculate standard RD correctly', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 5000,
        annualRate: 7,
        years: 5,
      });

      const result = calculateRD(inputs);

      expect(result.totalDeposits).toBe(300000); // 5000 * 12 * 5
      expect(result.maturityAmount).toBeGreaterThan(300000);
      expect(result.totalInterest).toBeGreaterThan(0);
      expectCloseTo(result.totalInterest, result.maturityAmount - result.totalDeposits, 2);
      expect(result.monthlyBreakdown).toHaveLength(60); // 5 years * 12 months
      
      // With 7% annual rate for 5 years, should be around 358,000
      expectCloseTo(result.maturityAmount, 358000, -3);
    });

    test('should calculate RD with different monthly deposits', () => {
      const testCases = [
        { monthlyDeposit: 1000, expectedTotalDeposits: 60000 },
        { monthlyDeposit: 10000, expectedTotalDeposits: 600000 },
        { monthlyDeposit: 25000, expectedTotalDeposits: 1500000 },
      ];

      testCases.forEach(({ monthlyDeposit, expectedTotalDeposits }) => {
        const inputs = createRDInputs({ 
          monthlyDeposit,
          annualRate: 7,
          years: 5 
        });
        const result = calculateRD(inputs);
        
        expect(result.totalDeposits).toBe(expectedTotalDeposits);
        expect(result.maturityAmount).toBeGreaterThan(expectedTotalDeposits);
        expect(result.totalInterest).toBeGreaterThan(0);
      });
    });

    test('should calculate RD with different interest rates', () => {
      const testCases = [
        { annualRate: 5, expectedMaturityRange: [330000, 342000] },
        { annualRate: 7, expectedMaturityRange: [350000, 362000] },
        { annualRate: 9, expectedMaturityRange: [370000, 380000] },
        { annualRate: 12, expectedMaturityRange: [400000, 420000] },
      ];

      testCases.forEach(({ annualRate, expectedMaturityRange }) => {
        const inputs = createRDInputs({ 
          monthlyDeposit: 5000,
          annualRate,
          years: 5 
        });
        const result = calculateRD(inputs);
        
        expect(result.maturityAmount).toBeGreaterThanOrEqual(expectedMaturityRange[0]);
        expect(result.maturityAmount).toBeLessThanOrEqual(expectedMaturityRange[1]);
      });
    });

    test('should calculate RD with different time periods', () => {
      const testCases = [
        { years: 1, expectedMaturityRange: [61900, 65000] },
        { years: 3, expectedMaturityRange: [195000, 205000] },
        { years: 5, expectedMaturityRange: [350000, 362000] },
        { years: 10, expectedMaturityRange: [850000, 900000] },
      ];

      testCases.forEach(({ years, expectedMaturityRange }) => {
        const inputs = createRDInputs({ 
          monthlyDeposit: 5000,
          annualRate: 7,
          years 
        });
        const result = calculateRD(inputs);
        
        expect(result.maturityAmount).toBeGreaterThanOrEqual(expectedMaturityRange[0]);
        expect(result.maturityAmount).toBeLessThanOrEqual(expectedMaturityRange[1]);
        expect(result.monthlyBreakdown).toHaveLength(years * 12);
      });
    });
  });

  describe('📊 Monthly Breakdown Accuracy Tests', () => {
    
    test('should generate accurate monthly breakdown', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 10000,
        annualRate: 8,
        years: 2, // Short term for easier verification
      });

      const result = calculateRD(inputs);

      expect(result.monthlyBreakdown).toHaveLength(24);

      // Check first month - first month has no previous balance so interest is 0
      const firstMonth = result.monthlyBreakdown[0];
      expect(firstMonth.month).toBe(1);
      expect(firstMonth.deposit).toBe(10000);
      expect(firstMonth.totalDeposited).toBe(10000);
      expect(firstMonth.balance).toBe(10000); // First month: no previous balance = no interest
      expect(firstMonth.interest).toBe(0); // First month has no interest

      // Check that deposits are consistent
      result.monthlyBreakdown.forEach((month, index) => {
        expect(month.month).toBe(index + 1);
        expect(month.deposit).toBe(10000);
        expect(month.totalDeposited).toBe((index + 1) * 10000);
        if (index === 0) {
          // First month: balance equals deposit (no previous balance for interest)
          expect(month.balance).toBe(month.totalDeposited);
          expect(month.interest).toBe(0);
        } else {
          // Subsequent months: balance > deposits due to accumulated interest
          expect(month.balance).toBeGreaterThan(month.totalDeposited);
          expect(month.interest).toBeGreaterThan(0);
        }
      });

      // Check that balance increases over time
      for (let i = 1; i < result.monthlyBreakdown.length; i++) {
        expect(result.monthlyBreakdown[i].balance).toBeGreaterThan(
          result.monthlyBreakdown[i - 1].balance
        );
      }
    });

    test('should calculate cumulative values correctly', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 8000,
        annualRate: 6,
        years: 3,
      });

      const result = calculateRD(inputs);

      result.monthlyBreakdown.forEach((month, index) => {
        // Total deposited should increase by monthly deposit each month
        const expectedTotalDeposited = (index + 1) * 8000;
        expect(month.totalDeposited).toBe(expectedTotalDeposited);

        // Balance should be greater than or equal to total deposited
        if (index === 0) {
          // First month: balance equals deposit (no previous balance for interest)
          expect(month.balance).toBe(month.totalDeposited);
          expect(month.interest).toBe(0);
        } else {
          // Subsequent months: balance > deposits due to accumulated interest
          expect(month.balance).toBeGreaterThan(month.totalDeposited);
          expect(month.interest).toBeGreaterThan(0);
        }
      });

      // Final month values should match overall results
      const finalMonth = result.monthlyBreakdown[result.monthlyBreakdown.length - 1];
      expectCloseTo(finalMonth.balance, result.maturityAmount, 2);
      expectCloseTo(finalMonth.totalDeposited, result.totalDeposits, 2);
    });

    test('should calculate interest correctly each month', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 5000,
        annualRate: 12, // 12% annual = 1% monthly
        years: 1,
      });

      const result = calculateRD(inputs);

      const monthlyRate = 0.12 / 12; // 1% per month

      // Verify interest calculation for each month
      let expectedBalance = 0;
      result.monthlyBreakdown.forEach((month, index) => {
        // Add monthly deposit and calculate interest
        const expectedInterest = expectedBalance * monthlyRate;
        expectedBalance = expectedBalance + month.deposit + expectedInterest;
        
        expectCloseTo(month.interest, expectedInterest, 1);
        expectCloseTo(month.balance, expectedBalance, 1);
      });
    });

    test('should handle compound interest correctly', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 1000,
        annualRate: 6,
        years: 2,
      });

      const result = calculateRD(inputs);

      const monthlyRate = 0.06 / 12;

      // Each month should show compound growth
      for (let i = 1; i < result.monthlyBreakdown.length; i++) {
        const prevMonth = result.monthlyBreakdown[i - 1];
        const currentMonth = result.monthlyBreakdown[i];
        
        // Current balance should be (previous balance + deposit) * (1 + rate)
        const expectedBalance = (prevMonth.balance + 1000) * (1 + monthlyRate);
        expectCloseTo(currentMonth.balance, expectedBalance, 1);
      }
    });
  });

  describe('🔥 Edge Cases & Boundary Tests', () => {
    
    test('should handle zero monthly deposit', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 0,
        annualRate: 7,
        years: 5,
      });

      const result = calculateRD(inputs);

      expect(result.totalDeposits).toBe(0);
      expect(result.maturityAmount).toBe(0);
      expect(result.totalInterest).toBe(0);
      expect(result.monthlyBreakdown).toHaveLength(60);
      
      // All monthly values should be zero
      result.monthlyBreakdown.forEach(month => {
        expect(month.deposit).toBe(0);
        expect(month.interest).toBe(0);
        expect(month.balance).toBe(0);
        expect(month.totalDeposited).toBe(0);
      });
    });

    test('should handle zero interest rate', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 5000,
        annualRate: 0,
        years: 3,
      });

      const result = calculateRD(inputs);

      expect(result.totalDeposits).toBe(180000); // 5000 * 12 * 3
      expectCloseTo(result.maturityAmount, 180000, 2); // No growth with 0% rate
      expectCloseTo(result.totalInterest, 0, 2);
      expect(result.monthlyBreakdown).toHaveLength(36);
      
      // All interest should be zero
      result.monthlyBreakdown.forEach(month => {
        expect(month.interest).toBe(0);
        expect(month.balance).toBe(month.totalDeposited);
      });
    });

    test('should handle very high interest rates', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 1000,
        annualRate: 50, // 50% annual rate
        years: 3,
      });

      const result = calculateRD(inputs);

      expect(result.totalDeposits).toBe(36000);
      expect(result.maturityAmount).toBeGreaterThan(80000);
      expect(result.totalInterest).toBeGreaterThan(result.totalDeposits);
    });

    test('should handle very short periods', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 10000,
        annualRate: 8,
        years: 1,
      });

      const result = calculateRD(inputs);

      expect(result.monthlyBreakdown).toHaveLength(12);
      expect(result.totalDeposits).toBe(120000);
      expect(result.maturityAmount).toBeGreaterThan(120000);
    });

    test('should handle very long periods', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 5000,
        annualRate: 7,
        years: 30, // 30 years
      });

      const result = calculateRD(inputs);

      expect(result.monthlyBreakdown).toHaveLength(360);
      expect(result.totalDeposits).toBe(1800000); // 5000 * 12 * 30
      expect(result.maturityAmount).toBeGreaterThan(5000000); // Should be over 50 lakhs
    });

    test('should handle very small monthly deposits', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 100,
        annualRate: 7,
        years: 5,
      });

      const result = calculateRD(inputs);

      expect(result.totalDeposits).toBe(6000);
      expect(result.maturityAmount).toBeGreaterThan(6000);
      expect(result.totalInterest).toBeGreaterThan(0);
    });

    test('should handle very large monthly deposits', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 100000,
        annualRate: 7,
        years: 5,
      });

      const result = calculateRD(inputs);

      expect(result.totalDeposits).toBe(6000000);
      expect(result.maturityAmount).toBeGreaterThan(7000000);
      expect(result.totalInterest).toBeGreaterThan(1000000);
    });

    test('should handle fractional monthly deposits', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 5555.55,
        annualRate: 7.25,
        years: 3.5,
      });

      const result = calculateRD(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.totalDeposits)).toBe(true);
      expect(Number.isFinite(result.maturityAmount)).toBe(true);
      expect(Number.isFinite(result.totalInterest)).toBe(true);
    });

    test('should handle fractional years', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 5000,
        annualRate: 8,
        years: 2.5, // 2.5 years = 30 months
      });

      const result = calculateRD(inputs);

      expect(result.monthlyBreakdown).toHaveLength(30);
      expect(result.totalDeposits).toBe(150000);
      expect(result.maturityAmount).toBeGreaterThan(150000);
    });
  });

  describe('🛡️ Input Validation & Robustness Tests', () => {
    
    test('should handle invalid monthly deposit inputs', () => {
      const testCases = [
        { monthlyDeposit: null },
        { monthlyDeposit: undefined },
        { monthlyDeposit: '' },
        { monthlyDeposit: 'invalid' },
        { monthlyDeposit: -5000 }, // Negative deposit
      ];

      testCases.forEach(({ monthlyDeposit }) => {
        const inputs = createRDInputs({ monthlyDeposit: monthlyDeposit as any });
        const result = calculateRD(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.totalDeposits).toBe('number');
        expect(typeof result.maturityAmount).toBe('number');
        expect(isFinite(result.totalDeposits)).toBe(true);
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
        const inputs = createRDInputs({ annualRate: annualRate as any });
        const result = calculateRD(inputs);
        
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
        const inputs = createRDInputs({ years: years as any });
        const result = calculateRD(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.maturityAmount).toBe('number');
        expect(isFinite(result.maturityAmount)).toBe(true);
      });
    });

    test('should handle string inputs with currency symbols', () => {
      const inputs = createRDInputs({
        monthlyDeposit: '₹5,000' as any,
        annualRate: '7%' as any,
        years: '5 years' as any,
      });

      const result = calculateRD(inputs);

      expect(result).toBeDefined();
      expect(result.totalDeposits).toBeGreaterThan(0);
      expect(result.maturityAmount).toBeGreaterThan(result.totalDeposits);
    });

    test('should handle floating point precision issues', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 5000.123456789,
        annualRate: 7.987654321,
        years: 5.123456789,
      });

      const result = calculateRD(inputs);

      expect(result).toBeDefined();
      expect(Number.isFinite(result.totalDeposits)).toBe(true);
      expect(Number.isFinite(result.maturityAmount)).toBe(true);
      expect(Number.isFinite(result.totalInterest)).toBe(true);
    });

    test('should handle very large numbers safely', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 1e6, // Very large monthly deposit
        annualRate: 7,
        years: 10,
      });

      const result = calculateRD(inputs);

      expect(result).toBeDefined();
      expect(isFinite(result.totalDeposits)).toBe(true);
      expect(isFinite(result.maturityAmount)).toBe(true);
    });
  });

  describe('🧮 Mathematical Accuracy Tests', () => {
    
    test('should verify RD interest calculation accuracy', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 1000,
        annualRate: 12, // 12% annual = 1% monthly
        years: 1,
      });

      const result = calculateRD(inputs);

      const monthlyRate = 0.12 / 12;

      // Manual calculation for verification
      let expectedBalance = 0;
      result.monthlyBreakdown.forEach((month, index) => {
        const expectedInterest = expectedBalance * monthlyRate;
        expectedBalance = expectedBalance + month.deposit + expectedInterest;
        
        expectCloseTo(month.interest, expectedInterest, 1);
        expectCloseTo(month.balance, expectedBalance, 1);
      });
    });

    test('should verify total deposits calculation', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 7500,
        annualRate: 8,
        years: 6,
      });

      const result = calculateRD(inputs);

      // Total deposits should equal monthly deposit * months
      const expectedTotalDeposits = 7500 * 6 * 12;
      expect(result.totalDeposits).toBe(expectedTotalDeposits);

      // Total interest should equal maturity amount minus total deposits
      expectCloseTo(result.totalInterest, result.maturityAmount - result.totalDeposits, 2);
    });

    test('should verify monthly breakdown calculations', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 3000,
        annualRate: 9,
        years: 2,
      });

      const result = calculateRD(inputs);

      const monthlyRate = 0.09 / 12;

      // Verify each month's calculation
      let expectedBalance = 0;
      result.monthlyBreakdown.forEach((month, index) => {
        // Add monthly deposit and apply interest
        const expectedInterest = expectedBalance * monthlyRate;
        expectedBalance = expectedBalance + 3000 + expectedInterest;
        
        expectCloseTo(month.balance, expectedBalance, 1);
        expect(month.totalDeposited).toBe((index + 1) * 3000);
        expectCloseTo(month.interest, expectedInterest, 1);
      });
    });

    test('should verify compound growth calculations', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 2000,
        annualRate: 6,
        years: 3,
      });

      const result = calculateRD(inputs);

      // Each month should show compound growth
      const monthlyRate = 0.06 / 12;
      
      for (let i = 1; i < result.monthlyBreakdown.length; i++) {
        const prevMonth = result.monthlyBreakdown[i - 1];
        const currentMonth = result.monthlyBreakdown[i];
        
        // Current balance should be (previous balance + deposit) * (1 + rate)
        const expectedBalance = (prevMonth.balance + 2000) * (1 + monthlyRate);
        expectCloseTo(currentMonth.balance, expectedBalance, 1);
      }
    });
  });

  describe('⚡ Performance & Stress Tests', () => {
    
    test('should handle very long RD periods efficiently', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 5000,
        annualRate: 7,
        years: 50, // 50 years = 600 months
      });

      const startTime = Date.now();
      const result = calculateRD(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.monthlyBreakdown).toHaveLength(600);
      expect(result.maturityAmount).toBeGreaterThan(10000000); // Should be over 1 crore
    });

    test('should handle multiple calculations efficiently', () => {
      const testCases = Array.from({ length: 100 }, (_, i) => ({
        monthlyDeposit: 1000 + i * 100,
        annualRate: 5 + i % 10,
        years: 1 + i % 10,
      }));

      const startTime = Date.now();
      
      testCases.forEach(inputs => {
        const result = calculateRD(inputs);
        expect(result).toBeDefined();
        expect(result.maturityAmount).toBeGreaterThan(0);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should handle large monthly deposits efficiently', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 1000000, // 10 lakhs per month
        annualRate: 7,
        years: 10,
      });

      const startTime = Date.now();
      const result = calculateRD(inputs);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(result.totalDeposits).toBe(120000000); // 12 crores
      expect(result.maturityAmount).toBeGreaterThan(170000000); // Over 17 crores
    });
  });

  describe('🔍 Regression Tests', () => {
    
    test('should maintain consistent results for known scenarios', () => {
      // Known test case with expected results
      const inputs = createRDInputs({
        monthlyDeposit: 5000,
        annualRate: 7,
        years: 5,
      });

      const result = calculateRD(inputs);

      // These values should remain consistent across code changes
      expect(result.totalDeposits).toBe(300000);
      expect(result.maturityAmount).toBeGreaterThan(350000);
      expect(result.maturityAmount).toBeLessThan(370000);
      expect(result.totalInterest).toBeGreaterThan(50000);
      expect(result.monthlyBreakdown).toHaveLength(60);
    });

    test('should handle edge case combinations consistently', () => {
      const edgeCases = [
        { monthlyDeposit: 0, annualRate: 7, years: 5 },
        { monthlyDeposit: 100000, annualRate: 0, years: 1 },
        { monthlyDeposit: 5000, annualRate: 25, years: 10 },
      ];

      edgeCases.forEach(inputs => {
        const result = calculateRD(inputs);
        
        expect(result).toBeDefined();
        expect(typeof result.totalDeposits).toBe('number');
        expect(typeof result.maturityAmount).toBe('number');
        expect(typeof result.totalInterest).toBe('number');
        expect(Array.isArray(result.monthlyBreakdown)).toBe(true);
        
        expect(isFinite(result.totalDeposits)).toBe(true);
        expect(isFinite(result.maturityAmount)).toBe(true);
        expect(isFinite(result.totalInterest)).toBe(true);
      });
    });

    test('should verify mathematical relationships', () => {
      const inputs = createRDInputs({
        monthlyDeposit: 8000,
        annualRate: 8.5,
        years: 7,
      });

      const result = calculateRD(inputs);

      // Mathematical relationships that should always hold
      expect(result.maturityAmount).toBeGreaterThanOrEqual(result.totalDeposits);
      expect(result.totalInterest).toBe(result.maturityAmount - result.totalDeposits);
      expect(result.totalDeposits).toBe(inputs.monthlyDeposit * 12 * inputs.years);
      
      // Monthly breakdown should be consistent
      if (result.monthlyBreakdown.length > 0) {
        const finalMonth = result.monthlyBreakdown[result.monthlyBreakdown.length - 1];
        expectCloseTo(finalMonth.balance, result.maturityAmount, 2);
        expectCloseTo(finalMonth.totalDeposited, result.totalDeposits, 2);
      }
      
      // Each month should have consistent calculations
      result.monthlyBreakdown.forEach((month, index) => {
        expect(month.month).toBe(index + 1);
        expect(month.deposit).toBe(inputs.monthlyDeposit);
        expect(month.totalDeposited).toBe((index + 1) * inputs.monthlyDeposit);
        expect(month.balance).toBeGreaterThanOrEqual(month.totalDeposited);
        expect(month.interest).toBeGreaterThanOrEqual(0);
      });
    });
  });
});